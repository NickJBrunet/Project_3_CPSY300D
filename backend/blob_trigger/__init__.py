import azure.functions as func
import pandas as pd
import io
import json
import os
from azure.storage.blob import BlobServiceClient
from redis_client import get_redis_client

def main(blob: func.InputStream):
	print("BLOB TRIGGER FIRED")

	try:
		content = blob.read()
		df = pd.read_csv(io.BytesIO(content)).copy()

		numeric_cols = ["Protein(g)", "Carbs(g)", "Fat(g)"]
		df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce")
		df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

		avg_macros = df.groupby("Diet_type")[numeric_cols].mean().reset_index()
		avg_macros[numeric_cols] = avg_macros[numeric_cols].round(2)

		recipes = df[[
			"Diet_type",
			"Recipe_name",
			"Cuisine_type",
			"Protein(g)",
			"Carbs(g)",
			"Fat(g)"
		]].to_dict(orient="records")

		bar_chart = avg_macros.to_dict(orient="records")

		pie_chart = (
			df["Diet_type"]
			.value_counts()
			.reset_index()
			.rename(columns={"index": "Diet_type", "Diet_type": "count"})
			.to_dict(orient="records")
		)

		scatter_chart = df[[
			"Protein(g)",
			"Carbs(g)",
			"Diet_type"
		]].to_dict(orient="records")

		heatmap = {
			"xLabels": ["Protein(g)", "Carbs(g)", "Fat(g)"],
			"yLabels": avg_macros["Diet_type"].tolist(),
			"values": avg_macros[numeric_cols].values.tolist()
		}

		result = {
			"summary": {
				"total_records": int(len(df)),
				"diet_types": int(df["Diet_type"].nunique())
			},
			"recipes": recipes,
			"avg_macros": avg_macros.to_dict(orient="records"),

			"charts": {
				"bar_chart": bar_chart,
				"pie_chart": pie_chart,
				"scatter_chart": scatter_chart,
				"heatmap": heatmap
			}
		}

		print("DATA PROCESSED")

		# TRY REDIS
		r = get_redis_client()

		if r:
			r.set("diet_data", json.dumps(result))
			print("STORED IN REDIS")
		else:
			connect_str = os.getenv("AzureWebJobsStorage")
			blob_service_client = BlobServiceClient.from_connection_string(connect_str)

			blob_client = blob_service_client.get_blob_client(
				container="cache",
				blob="processed_data.json"
			)

			blob_client.upload_blob(json.dumps(result), overwrite=True)
			print("STORED IN BLOB (fallback)")

	except Exception as e:
		print("ERROR:", str(e))