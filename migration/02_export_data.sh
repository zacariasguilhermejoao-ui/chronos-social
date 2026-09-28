#!/usr/bin/env bash
set -euo pipefail
: "${OLD_DB_URL:?Define OLD_DB_URL antes de correr}"
echo "==> A exportar dados do schema public..."
pg_dump "$OLD_DB_URL" --data-only --schema=public --no-owner --no-privileges --disable-triggers -Fc -f data.dump
echo "==> A exportar utilizadores (auth.users e identidades)..."
pg_dump "$OLD_DB_URL" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges -Fc -f auth.dump
echo "==> A exportar schema real..."
pg_dump "$OLD_DB_URL" --schema-only --schema=public --no-owner --no-privileges -f schema_real.sql
echo "OK: data.dump, auth.dump, schema_real.sql"
