# Chrónos — App Android e iOS (Capacitor)

A app já tem Capacitor configurado (`com.chronossocial.app`).

## Requisitos

| Plataforma | Precisas de |
|------------|-------------|
| **Android** | PC com [Android Studio](https://developer.android.com/studio) |
| **iOS** | **Mac** com [Xcode](https://developer.apple.com/xcode/) (obrigatório) |

## 1. Preparar o projeto

```bash
git clone https://github.com/zacariasguilhermejoao-ui/chronos-social.git
cd chronos-social
npm install
```

Confirma `.env.local` com Supabase (URL + anon key).

## 2. Adicionar plataformas (só a primeira vez)

```bash
npx cap add android
npx cap add ios
```

Isto cria as pastas `android/` e `ios/`.

## 3. Sincronizar

```bash
npm run build
npx cap sync
```

Ou usa os scripts:

```bash
npm run mobile:sync
```

## 4. Abrir no Android Studio / Xcode

```bash
npm run mobile:android   # abre Android Studio
npm run mobile:ios       # abre Xcode (só no Mac)
```

### Android
1. Android Studio abre o projeto `android/`
2. Liga um telemóvel (USB + depuração) ou usa emulador
3. Clica **Run** (▶)
4. Para gerar APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

### iOS (só Mac)
1. Xcode abre o projeto `ios/App`
2. Escolhe o teu Apple ID em Signing & Capabilities
3. Liga iPhone ou usa Simulator
4. Clica **Run** (▶)
5. Para App Store: **Product → Archive**

## 5. Domínio próprio (quando estiveres pronto)

No ficheiro `capacitor.config.ts`, troca `server.url` pelo teu domínio, por exemplo:

```ts
server: {
  url: "https://oseudominio.com",
  cleartext: false,
},
```

Depois:

```bash
npx cap sync
```

## 6. App “embutida” (sem abrir site externo)

Se quiseres o HTML dentro da app (offline parcial):

1. Em `capacitor.config.ts`, **comenta** o bloco `server: { ... }`
2. Corre:

```bash
npm run build
npx cap sync
npm run mobile:android   # ou mobile:ios
```

## Scripts no package.json

| Comando | O que faz |
|---------|-----------|
| `npm run mobile:sync` | build + cap sync |
| `npm run mobile:android` | abre Android Studio |
| `npm run mobile:ios` | abre Xcode |

## Notas

- **Push notifications**: já há `@capacitor/push-notifications` e `PushBridge` no código.
- **Google Services**: se usares FCM, coloca `google-services.json` em `android/app/`.
- Não consigo gerar o APK/IPA daqui — tens de compilar no Android Studio / Xcode (ou num CI).
