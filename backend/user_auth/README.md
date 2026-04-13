# Azure SQL Profile Storage Setup

## What to create in Azure

1. Create an Azure SQL server and database.
2. Enable Transparent Data Encryption (TDE) on the database (enabled by default).
3. Set firewall rules to allow your Azure Function app or local developer IP.
4. Use `Encrypt=yes;TrustServerCertificate=no` in the connection string.

## Recommended table

```sql
CREATE TABLE dbo.Users (
    uid NVARCHAR(128) NOT NULL PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    phoneNumber NVARCHAR(32) NULL,
    provider NVARCHAR(64) NULL,
    passwordHash NVARCHAR(512) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
```

## Azure Function settings

Add these values in the Function App Configuration:

- `FUNCTIONS_WORKER_RUNTIME`: `python`
- `AzureWebJobsStorage`: your storage connection string
- `SQL_CONNECTION_STRING`: `Driver={ODBC Driver 18 for SQL Server};Server=tcp:<your-server>.database.windows.net,1433;Database=<your-db>;Uid=<user>;Pwd=<password>;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`

## How the code works

- Frontend calls `POST /auth/profile` on the Azure function.
- The function upserts the user profile into Azure SQL.
- Passwords are never stored as plain text; if a password is provided, the function stores a hashed value.
- Azure SQL encrypts data at rest using TDE and encrypts transit with `Encrypt=yes`.

## Local development

Use the Azure Functions Core Tools and set `NEXT_PUBLIC_AUTH_API_URL=http://localhost:7071/api` in `.env.local` for local testing.
