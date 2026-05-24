import { showHUD } from "@vicinae/api";
import {
  getStatus,
  startInhibitor,
  stopInhibitor,
  isSupported,
} from "./inhibit";

export default async function Command() {
  if (!isSupported()) {
    await showHUD("⚠️ systemd-inhibit not available");
    return;
  }

  const status = getStatus();
  if (status.active) {
    stopInhibitor();
    await showHUD("💤 Caffeinate off");
  } else {
    startInhibitor();
    await showHUD("☕ Caffeinate on");
  }
}