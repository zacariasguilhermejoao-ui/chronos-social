# Chrónos — App nativa Android e iOS

Sem Lovable. Sem abrir site. Conteúdo em `dist/` dentro da app.

- **App ID:** `com.chronossocial.app`
- **Nome:** Chrónos

## Requisitos

| | |
|--|--|
| Android | Android Studio |
| iOS | Mac + Xcode |

## Passos

```bash
git pull && npm install

# .env.local com VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY

npx cap add android   # só 1ª vez
npx cap add ios       # só 1ª vez (Mac)

npm run mobile:sync   # build → copia dist para android/ios
npm run mobile:android
```

No Android Studio: **Run** ▶ para instalar no telemóvel.  
APK release: **Build → Generate Signed Bundle / APK**.

## Push nativo

- Código: `src/lib/firebasePush.ts` + `PushBridge`
- Android: `google-services.json` em `android/app/`
- iOS: APNs no Apple Developer + Xcode
