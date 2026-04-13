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


def main(req: func.HttpRequest) -> func.HttpResponse:
    route = req.route_params.get("route")

    if route != "profile":
        return func.HttpResponse(
            json.dumps({"error": "Route not found."}),
            status_code=404,
            mimetype="application/json",
        )

    if req.method == "GET":
        uid = req.params.get("uid")
        if not uid:
            return func.HttpResponse(
                json.dumps({"error": "Missing uid query parameter."}),
                status_code=400,
                mimetype="application/json",
            )

        profile = fetch_user_profile(uid)
        if not profile:
            return func.HttpResponse(
                json.dumps({"error": "User not found."}),
                status_code=404,
                mimetype="application/json",
            )

        return func.HttpResponse(
            json.dumps(profile),
            status_code=200,
            mimetype="application/json",
        )

    if req.method == "POST":
        try:
            payload = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON payload."}),
                status_code=400,
                mimetype="application/json",
            )

        uid = payload.get("uid")
        email = payload.get("email")
        phone_number = payload.get("phoneNumber", "")
        provider = payload.get("provider", "unknown")
        password = payload.get("password")

        if not uid or not email:
            return func.HttpResponse(
                json.dumps({"error": "uid and email are required."}),
                status_code=400,
                mimetype="application/json",
            )

        password_hash = None
        if password:
            password_hash = hash_password(password)

        upsert_user_profile(uid, email, phone_number, provider, password_hash)
        return func.HttpResponse(
            json.dumps({"status": "ok"}),
            status_code=200,
            mimetype="application/json",
        )

    return func.HttpResponse(
        json.dumps({"error": "Method not allowed."}),
        status_code=405,
        mimetype="application/json",
    )