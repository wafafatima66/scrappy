import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.patchlet.app",
  appName: "Patchlet",
  webDir: "out",
  android: { backgroundColor: "#f6f0fa" },
  plugins: {
    LocalNotifications: { smallIcon: "ic_stat_icon", iconColor: "#7C65D6" },
    StatusBar: { style: "DARK", backgroundColor: "#f6f0fa" },
  },
};

export default config;
