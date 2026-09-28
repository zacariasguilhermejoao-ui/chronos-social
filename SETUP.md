# Chrónos — Como correr a app

O Supabase já está configurado no teu projeto. Só falta ligar as chaves e instalar dependências.

## 1. Clonar e instalar

```bash
git clone https://github.com/zacariasguilhermejoao-ui/chronos-social.git
cd chronos-social
npm install
```

## 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edita `.env.local`:

1. Abre o [Supabase Dashboard](https://supabase.com/dashboard)
2. Project Settings → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

Exemplo:

```
VITE_SUPABASE_URL=https://ohosjxtncrshuuansoaq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Arrancar

```bash
npm run dev
```

Abre http://localhost:5173

## O que já está no repo

- App completa (rotas, auth, feed, chat, grupos, wallet, marketplace…)
- Cliente Supabase em `src/integrations/supabase/client.ts`
- Schema essencial em `migration/01_schema.sql`
- Storage buckets em `migration/07_storage_buckets.sql`

## Se der erro de compilação

Alguns ecrãs usam versões simplificadas face ao ZIP original.
Se aparecer `Cannot find module`:

```bash
npm install
npm run dev
```

Se o erro for de tipos Supabase, o stub em `src/integrations/supabase/types.ts` já permite compilar.

## Produção (build)

```bash
npm run build
npm run preview
```
