import redis
import os

def get_redis_client():
    try:
        conn_str = os.getenv("REDIS_CONNECTION_STRING")

        host = conn_str.split(",")[0].split(":")[0]
        port = int(conn_str.split(",")[0].split(":")[1])
        password = conn_str.split("password=")[1].split(",")[0]

        r = redis.Redis(
            host=host,
            port=port,
            password=password,
            ssl=True,
            ssl_cert_reqs=None,
            socket_connect_timeout=2,
            socket_timeout=2
        )

        r.ping()
        print("REDIS CONNECTED")
        return r

    except Exception as e:
        print("REDIS FAILED:", str(e))
        return None