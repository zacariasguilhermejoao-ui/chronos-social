#!/usr/bin/env bash
set -euo pipefail
: "${NEW_DB_URL:?Define NEW_DB_URL antes de correr}"
echo "==> 1/3 Schema..."
psql "$NEW_DB_URL" -v ON_ERROR_STOP=0 -f 01_schema.sql
if [ -f auth.dump ]; then
  echo "==> 2/3 Utilizadores (auth)..."
  pg_restore --data-only --no-owner --disable-triggers -d "$NEW_DB_URL" auth.dump || true
fi
if [ -f data.dump ]; then
  echo "==> 3/3 Dados da aplicação..."
  pg_restore --data-only --no-owner --disable-triggers -d "$NEW_DB_URL" data.dump || true
fi
echo "==> Verificação rápida:"
psql "$NEW_DB_URL" -c "select 'profiles' t, count(*) from public.profiles union all select 'videos', count(*) from public.videos union all select 'photos', count(*) from public.photos union all select 'auth.users', count(*) from auth.users;"
