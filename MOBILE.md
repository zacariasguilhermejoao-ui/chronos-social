# Chrónos — App Android e iOS (Capacitor)

Domínio de produção: **https://chronossocial.com**  
App ID: `com.chronossocial.app`

## Requisitos

| Plataforma | Precisas de |
|------------|-------------|
| **Android** | PC com [Android Studio](https://developer.android.com/studio) |
| **iOS** | **Mac** com [Xcode](https://developer.apple.com/xcode/) |

## 1. Preparar

```bash
git clone https://github.com/zacariasguilhermejoao-ui/chronos-social.git
cd chronos-social
npm install
git pull
```

Confirma `.env.local` com Supabase.

## 2. Adicionar plataformas (primeira vez)

```bash
npx cap add android
npx cap add ios
```

## 3. Sincronizar e abrir

```bash
npm run mobile:sync
npm run mobile:android   # Android Studio → Run → APK
npm run mobile:ios       # Xcode (só Mac)
```

A app nativa abre **https://chronossocial.com**.

## Scripts

| Comando | Função |
|---------|--------|
| `npm run mobile:sync` | build + cap sync |
| `npm run mobile:android` | abre Android Studio |
| `npm run mobile:ios` | abre Xcode |
