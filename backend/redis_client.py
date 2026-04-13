import os
import redis
from azure.identity import DefaultAzureCredential

def get_redis_client():
    try:
        host = os.getenv("REDIS_HOST")
        port = int(os.getenv("REDIS_PORT"))
        username = os.getenv("REDIS_USERNAME")

        credential = DefaultAzureCredential()
        token = credential.get_token("https://redis.azure.com/.default")


        r = redis.Redis(
            host=host,
            port=port,
            username=username,
            password=token.token,
            ssl=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            decode_responses=True
        )

        r.ping()
        print(f"REDIS CONNECTED as {username}")

        return r

    except Exception as e:
        print("REDIS FAILED:", str(e))
        return None