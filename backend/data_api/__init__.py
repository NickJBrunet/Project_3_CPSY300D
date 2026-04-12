import azure.functions as func
import json
import os
import redis
import pyodbc
import socket
import time
from azure.storage.blob import BlobServiceClient

def main(req: func.HttpRequest) -> func.HttpResponse:
	route = req.route_params.get('route')

	print("FUNCTION STARTED")
	print("Route:", route)

	if route == "data":
		try:
			connect_str = os.getenv("AzureWebJobsStorage")
			blob_service_client = BlobServiceClient.from_connection_string(connect_str)

			blob_client = blob_service_client.get_blob_client(
				container="cache",
				blob="processed_data.json"
			)

			data = blob_client.download_blob().readall()

			return func.HttpResponse(
				data,
				mimetype="application/json"
			)

		except Exception as e:
			return func.HttpResponse(
				json.dumps({"error": str(e)}),
				status_code=500,
				mimetype="application/json"
        )