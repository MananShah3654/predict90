# Auth Testing Playbook — Predict90

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index exists on users.email.

## Step 2: API Testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@predict90.com","password":"Admin@123"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
```
Login returns user object + `token` field and sets `access_token` httpOnly cookie.
`/me` works with cookie OR `Authorization: Bearer <token>` header.

## Credentials
See /app/memory/test_credentials.md
