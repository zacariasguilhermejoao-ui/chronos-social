import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.chronossocial.app",
  appName: "Chronos Social",
  webDir: "dist",
  server: {
    url: "https://1549f2d2-e51c-4319-95f3-9875a7192b52.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  android: {
    backgroundColor: "#0a0a0f",
  },
  ios: {
    backgroundColor: "#0a0a0f",
  },
};

export default config;
