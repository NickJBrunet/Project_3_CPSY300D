import azure.functions as func
import json
import os
from azure.storage.blob import BlobServiceClient
from redis_client import get_redis_client

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
	elif route == "recipes":
		try:
			print("API HIT: /recipes")

			# LOAD CACHE (reuse your existing logic)
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

			# QUERY PARAMS
			diet = req.params.get("diet")
			search = req.params.get("search")
			page = int(req.params.get("page", 1))
			limit = int(req.params.get("limit", 10))

			# FILTER: diet
			if diet and diet != "all":
				recipes = [r for r in recipes if r["Diet_type"].lower() == diet.lower()]

			# SEARCH: keyword
			if search:
				search = search.lower()
				recipes = [
					r for r in recipes
					if search in r["Recipe_name"].lower()
					or search in r["Cuisine_type"].lower()
				]

			total = len(recipes)

			# PAGINATION
			start = (page - 1) * limit
			end = start + limit
			paginated = recipes[start:end]

			return func.HttpResponse(
				json.dumps({
					"total": total,
					"page": page,
					"limit": limit,
					"results": paginated
				}),
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