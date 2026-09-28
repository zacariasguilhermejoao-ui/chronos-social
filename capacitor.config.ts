import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Chrónos — Capacitor (Android + iOS)
 *
 * server.url = app online (Lovable / domínio).
 * Quando tiveres domínio próprio, troca a URL abaixo.
 * Para app offline (webDir), comenta o bloco server e faz: npm run build && npx cap sync
 */
const config: CapacitorConfig = {
  appId: "com.chronossocial.app",
  appName: "Chrónos",
  webDir: "dist",
  server: {
    // App online no Lovable — a app nativa abre este site
    url: "https://1549f2d2-e51c-4319-95f3-9875a7192b52.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  android: {
    backgroundColor: "#090909",
    allowMixedContent: true,
  },
  ios: {
    backgroundColor: "#090909",
    contentInset: "automatic",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
