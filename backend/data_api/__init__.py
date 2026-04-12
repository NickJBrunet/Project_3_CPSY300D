import azure.functions as func
import json
import os
from azure.storage.blob import BlobServiceClient
from utils.redis_client import get_redis_client

def main(req: func.HttpRequest) -> func.HttpResponse:
    route = req.route_params.get("route")

    if route == "data":
        try:
            print("API HIT: /data")

            # TRY REDIS FIRST
            r = get_redis_client()

            if r:
                print("TRYING REDIS")

                data = r.get("diet_data")

                if data:
                    print("READ FROM REDIS")

                    # 🔥 ensure bytes → string
                    if isinstance(data, bytes):
                        data = data.decode()

                    return func.HttpResponse(
                        data,
                        mimetype="application/json"
                    )

                print("REDIS EMPTY")

            else:
                print("REDIS FAILED / NOT AVAILABLE")

            # FALLBACK TO BLOB
            print("READ FROM BLOB")

            connect_str = os.getenv("AzureWebJobsStorage")
            blob_service_client = BlobServiceClient.from_connection_string(connect_str)

            blob_client = blob_service_client.get_blob_client(
                container="cache",
                blob="processed_data.json"
            )

            data = blob_client.download_blob().readall()

            print("READ FROM BLOB SUCCESS")

            return func.HttpResponse(
                data,
                mimetype="application/json"
            )

        except Exception as e:
            print("ERROR:", str(e))
            return func.HttpResponse(
                json.dumps({"error": str(e)}),
                status_code=500,
                mimetype="application/json"
            )

    return func.HttpResponse("Invalid route", status_code=400)