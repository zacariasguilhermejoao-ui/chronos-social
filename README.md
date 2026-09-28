# Chrónos Social

Rede social — web + Android + iOS.

- **Web:** https://chronossocial.com  
- **GitHub:** https://github.com/zacariasguilhermejoao-ui/chronos-social  
- **Supabase:** `tdehdxwdechsadpfencc`  
- **App ID nativo:** `com.chronossocial.app`

## Arranque rápido (web)

```bash
git clone https://github.com/zacariasguilhermejoao-ui/chronos-social.git
cd chronos-social
npm install
cp .env.example .env.local
# Edita .env.local e cola a anon key do Supabase
npm run dev
```

Abre http://localhost:5173

## Build web (produção)

```bash
npm run build
# pasta dist/ → alojar em Vercel, Netlify, Cloudflare Pages, VPS, etc.
npm run preview   # testar dist localmente
```

Liga o domínio **chronossocial.com** ao hosting (não Lovable).

## App nativa Android / iOS

Ver **[MOBILE.md](./MOBILE.md)**.

```bash
npx cap add android   # 1ª vez
npx cap add ios       # 1ª vez (Mac)
npm run mobile:sync
npm run mobile:android
```

A app **não abre o browser** — o código fica dentro do APK/IPA.

## Stack

React · Vite · TypeScript · Tailwind · shadcn/ui · Supabase · Capacitor · OneSignal
