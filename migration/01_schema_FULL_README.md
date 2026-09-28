# Schema completo (243 KB)

O ficheiro original `01_schema.sql` tem **243 547 bytes** — demasiado grande para a API de push ficheiro a ficheiro usada nesta conversa.

## Já no repo
- `migration/01_schema.sql` — schema **essencial** (profiles, photos, videos, follows, messages, groups, wallet, stories, marketplace)
- `migration/07_storage_buckets.sql` — buckets e políticas de storage
- Várias migrations em `supabase/migrations/`

## Restaurar o schema 100% original do ZIP

```bash
# 1. Descompacta o zip da Chrónos
# 2. Copia o schema completo
cp /caminho/do/zip/migration/01_schema.sql migration/01_schema.sql

# 3. (Opcional) types gerados e icons originais
cp /caminho/do/zip/src/integrations/supabase/types.ts src/integrations/supabase/types.ts
cp /caminho/do/zip/src/lib/icons.ts src/lib/icons.ts

# 4. Commit
git add -A
git commit -m "Full original schema, types, icons from zip"
git push
```

## Aplicar no Supabase

```bash
psql "$DATABASE_URL" -f migration/01_schema.sql
psql "$DATABASE_URL" -f migration/07_storage_buckets.sql
```
