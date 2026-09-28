import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Chrónos — App nativa (Android + iOS)
 * O HTML/JS fica DENTRO da app (pasta dist/).
 * NÃO abre chronossocial.com nem qualquer URL externa.
 */
const config: CapacitorConfig = {
  appId: "com.chronossocial.app",
  appName: "Chrónos",
  webDir: "dist",
  // sem "server.url" = conteúdo nativo embutido
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
