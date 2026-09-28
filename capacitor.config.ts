import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Chrónos — Capacitor (Android + iOS)
 * Domínio de produção: https://chronossocial.com
 */
const config: CapacitorConfig = {
  appId: "com.chronossocial.app",
  appName: "Chrónos",
  webDir: "dist",
  server: {
    url: "https://chronossocial.com",
    cleartext: false,
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
