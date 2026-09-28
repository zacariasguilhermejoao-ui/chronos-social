import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Chrónos — App nativa Android + iOS
 * Conteúdo embutido em dist/ (não abre site externo).
 */
const config: CapacitorConfig = {
  appId: "com.chronossocial.app",
  appName: "Chrónos",
  webDir: "dist",
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
