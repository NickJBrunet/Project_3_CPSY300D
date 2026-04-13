import os
import json
import hashlib
import secrets
from datetime import datetime

import azure.functions as func
import pyodbc

SQL_CONNECTION_STRING = os.getenv("SQL_CONNECTION_STRING")


def get_connection():
    if not SQL_CONNECTION_STRING:
        raise RuntimeError("SQL_CONNECTION_STRING is not configured.")
    return pyodbc.connect(SQL_CONNECTION_STRING, autocommit=True)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return f"{salt.hex()}:{key.hex()}"


def fetch_user_profile(uid: str):
    with get_connection().cursor() as cursor:
        cursor.execute(
            "SELECT uid, email, phoneNumber, provider FROM dbo.Users WHERE uid = ?",
            uid,
        )
        row = cursor.fetchone()
        if not row:
            return None

        return {
            "uid": row.uid,
            "email": row.email,
            "phoneNumber": row.phoneNumber,
            "provider": row.provider,
        }


def upsert_user_profile(uid: str, email: str, phone_number: str, provider: str, password_hash: str | None = None):
    now = datetime.utcnow().isoformat()
    with get_connection().cursor() as cursor:
        cursor.execute(
            "IF EXISTS (SELECT 1 FROM dbo.Users WHERE uid = ?)"
            " UPDATE dbo.Users"
            " SET email = ?, phoneNumber = ?, provider = ?, passwordHash = COALESCE(?, passwordHash), updatedAt = ?"
            " WHERE uid = ?"
            " ELSE"
            " INSERT INTO dbo.Users (uid, email, phoneNumber, provider, passwordHash, createdAt, updatedAt)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            uid,
            email,
            phone_number,
            provider,
            password_hash,
            now,
            uid,
            uid,
            email,
            phone_number,
            provider,
            password_hash,
            now,
            now,
        )


def cors_response(body=None, status_code=200):
    headers = {
        "Access-Control-Allow-Origin": "https://ashy-meadow-04f9eb40f.1.azurestaticapps.net",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    return func.HttpResponse(
        body=json.dumps(body) if body is not None else "",
        status_code=status_code,
        mimetype="application/json",
        headers=headers,
    )


def main(req: func.HttpRequest) -> func.HttpResponse:
	try:
		if req.method == "OPTIONS":
			return cors_response()

		route = req.route_params.get("route")

		if route != "profile":
			return cors_response({"error": "Route not found."}, 404)

		if req.method == "GET":
			uid = req.params.get("uid")
			if not uid:
				return cors_response({"error": "Missing uid query parameter."}, 400)

			profile = fetch_user_profile(uid)
			if not profile:
				return cors_response({"error": "User not found."}, 404)

			return cors_response(profile, 200)

		if req.method == "POST":
			try:
				payload = req.get_json()
			except ValueError:
				return cors_response({"error": "Invalid JSON payload."}, 400)

			uid = payload.get("uid")
			email = payload.get("email")
			phone_number = payload.get("phoneNumber", "")
			provider = payload.get("provider", "unknown")
			password = payload.get("password")

			if not uid or not email:
				return cors_response({"error": "uid and email are required."}, 400)

			password_hash = None
			if password:
				password_hash = hash_password(password)

			upsert_user_profile(uid, email, phone_number, provider, password_hash)
			return cors_response({"status": "ok"}, 200)

		return cors_response({"error": "Method not allowed."}, 405)
	except Exception as e:
		print("FULL ERROR:", str(e))
		import traceback
		traceback.print_exc()

		return cors_response({"error": str(e)}, 500)