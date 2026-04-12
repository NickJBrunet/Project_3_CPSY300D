import azure.functions as func
from azure.storage.blob import BlobServiceClient
import pandas as pd
import io
import json
import os

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

        result = {
            "total_records": int(len(df)),
            "diet_types": int(df["Diet_type"].nunique()),
            "avg_macros": avg_macros.to_dict(orient="records"),
        }

        print("DATA PROCESSED")

        connect_str = os.getenv("AzureWebJobsStorage")
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)

        container = "cache"
        blob_name = "processed_data.json"

        blob_client = blob_service_client.get_blob_client(container=container, blob=blob_name)

        blob_client.upload_blob(json.dumps(result), overwrite=True)

        print("CACHED RESULT STORED")

    except Exception as e:
        print("ERROR:", str(e))