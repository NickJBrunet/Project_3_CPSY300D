import azure.functions as func
import json
import os
from azure.storage.blob import BlobServiceClient
from redis_client import get_redis_client


def cors_response(body=None, status_code=200):
    headers = {
        "Access-Control-Allow-Origin": "https://ashy-meadow-04f9eb40f.1.azurestaticapps.net",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    return func.HttpResponse(
        body=json.dumps(body) if isinstance(body, (dict, list)) else body,
        status_code=status_code,
        mimetype="application/json",
        headers=headers,
    )


def main(req: func.HttpRequest) -> func.HttpResponse:
    # handle preflight
    if req.method == "OPTIONS":
        return cors_response()

    route = req.route_params.get("route")

    if route == "data":
        try:
            print("API HIT: /data")

            r = get_redis_client()

            if r:
                print("TRYING REDIS")
                data = r.get("diet_data")

                if data:
                    print("READ FROM REDIS")
                    if isinstance(data, bytes):
                        data = data.decode()

                    return cors_response(data)

                print("REDIS EMPTY")
            else:
                print("REDIS FAILED / NOT AVAILABLE")

            print("READ FROM BLOB")

            connect_str = os.getenv("AzureWebJobsStorage")
            blob_service_client = BlobServiceClient.from_connection_string(connect_str)

            blob_client = blob_service_client.get_blob_client(
                container="cache",
                blob="processed_data.json"
            )

            data = blob_client.download_blob().readall()

            print("READ FROM BLOB SUCCESS")

            return cors_response(data)

        except Exception as e:
            print("ERROR:", str(e))
            return cors_response({"error": str(e)}, 500)

    elif route == "recipes":
        try:
            print("API HIT: /recipes")

            r = get_redis_client()
            cached_data = None

            if r:
                print("TRYING REDIS")
                cached_data = r.get("diet_data")
                if cached_data:
                    print("READ FROM REDIS")
                    if isinstance(cached_data, bytes):
                        cached_data = cached_data.decode()

            if not cached_data:
                print("FALLBACK TO BLOB")

                connect_str = os.getenv("AzureWebJobsStorage")
                blob_service_client = BlobServiceClient.from_connection_string(connect_str)

                blob_client = blob_service_client.get_blob_client(
                    container="cache",
                    blob="processed_data.json"
                )

                cached_data = blob_client.download_blob().readall()

            data = json.loads(cached_data)
            recipes = data.get("recipes", [])

            diet = req.params.get("diet")
            search = req.params.get("search")
            page = int(req.params.get("page", 1))
            limit = int(req.params.get("limit", 10))

            if diet and diet != "all":
                recipes = [r for r in recipes if r["Diet_type"].lower() == diet.lower()]

            if search:
                search = search.lower()
                recipes = [
                    r for r in recipes
                    if search in r["Recipe_name"].lower()
                    or search in r["Cuisine_type"].lower()
                ]

            total = len(recipes)

            start = (page - 1) * limit
            end = start + limit
            paginated = recipes[start:end]

            return cors_response({
                "total": total,
                "page": page,
                "limit": limit,
                "results": paginated
            })

        except Exception as e:
            print("ERROR:", str(e))
            return cors_response({"error": str(e)}, 500)

    return cors_response({"error": "Invalid route"}, 400)