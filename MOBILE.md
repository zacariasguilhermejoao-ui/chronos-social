# Chrónos — App nativa Android e iOS

A app **não abre o site**. O código web é compilado para `dist/` e embutido na app nativa (Capacitor).

- App ID: `com.chronossocial.app`
- Nome: **Chrónos**
- Conteúdo: pasta `dist/` (depois de `npm run build`)

## Requisitos

| Plataforma | Precisas |
|------------|----------|
| Android | [Android Studio](https://developer.android.com/studio) |
| iOS | **Mac** + [Xcode](https://developer.apple.com/xcode/) |

## Passos

```bash
git clone https://github.com/zacariasguilhermejoao-ui/chronos-social.git
cd chronos-social
npm install
git pull
```

Garante `.env.local` com:

```
VITE_SUPABASE_URL=https://tdehdxwdechsadpfencc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=a_tua_anon_key
```

### Primeira vez — criar projetos nativos

```bash
npx cap add android
npx cap add ios
```

### Sempre que mudares código

```bash
npm run mobile:sync
# = npm run build + npx cap sync
```

Isto:
1. Compila a app React para `dist/`
2. Copia `dist/` para dentro de `android/` e `ios/`

### Abrir e instalar

```bash
npm run mobile:android   # Android Studio → Run (▶) → APK no telemóvel
npm run mobile:ios       # Xcode (só Mac) → Run
```

## Importante

- **Não há `server.url`** — a app não carrega chronossocial.com.
- A app fala com o **Supabase** pela internet (API), como qualquer app nativa com backend.
- As chaves do `.env.local` entram no build (`VITE_...`); volta a fazer `npm run mobile:sync` se mudares o `.env.local`.

## Gerar APK de release (Android)

No Android Studio: **Build → Generate Signed Bundle / APK**.
