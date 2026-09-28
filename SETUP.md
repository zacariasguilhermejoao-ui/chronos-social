# Setup web + nativo (sem Lovable)

## 1. Ambiente

```bash
npm install
cp .env.example .env.local
```

`.env.local`:

```
VITE_SUPABASE_URL=https://tdehdxwdechsadpfencc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...anon...
```

## 2. Web local

```bash
npm run dev
```

## 3. Web produção

```bash
npm run build
```

Publica a pasta `dist/` onde o domínio **chronossocial.com** aponta  
(Vercel, Netlify, Cloudflare Pages, nginx, etc.).

## 4. Android / iOS

Ver `MOBILE.md`.
