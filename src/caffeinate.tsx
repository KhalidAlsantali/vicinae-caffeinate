import { useEffect, useState } from "react";
import {
  ActionPanel,
  Action,
  List,
  Icon,
  showToast,
  Toast,
} from "@vicinae/api";
import {
  getStatus,
  startInhibitor,
  stopInhibitor,
  formatRemaining,
  isSupported,
  type InhibitorStatus,
} from "./inhibit";

const DURATIONS: { label: string; seconds?: number }[] = [
  { label: "30 minutes", seconds: 30 * 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "2 hours", seconds: 2 * 60 * 60 },
  { label: "4 hours", seconds: 4 * 60 * 60 },
  { label: "8 hours", seconds: 8 * 60 * 60 },
  { label: "Indefinitely", seconds: undefined },
];

export default function Command() {
  const [status, setStatus] = useState<InhibitorStatus>({ active: false });
  const [, setTick] = useState(0);
  const supported = isSupported();

  const refresh = () => setStatus(getStatus());

  useEffect(() => {
    if (!supported) return;
    refresh();
    // Poll once a second so the countdown ticks down and external changes
    // (e.g. inhibitor expiring naturally) are reflected.
    const id = setInterval(() => {
      refresh();
      setTick((t: number) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [supported]);

  if (!supported) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Warning}
          title="systemd-inhibit not found"
          description="This extension requires a Linux system with systemd."
        />
      </List>
    );
  }

  const enable = async (seconds: number | undefined, label: string) => {
    // Avoid stacking — stop any previous inhibitor before starting a new one.
    stopInhibitor();
    startInhibitor(seconds);
    refresh();
    await showToast({
      style: Toast.Style.Success,
      title: seconds ? `Caffeinated for ${label}` : "Caffeinated indefinitely",
    });
  };

  const disable = async () => {
    stopInhibitor();
    refresh();
    await showToast({
      style: Toast.Style.Success,
      title: "Caffeinate off",
    });
  };

  const statusSubtitle = status.active
    ? status.endsAt
      ? formatRemaining(status.endsAt)
      : "indefinite"
    : "system can sleep normally";

  return (
    <List>
      <List.Section title="Status">
        <List.Item
          title={status.active ? "Caffeinated" : "Not caffeinated"}
          subtitle={statusSubtitle}
          icon={status.active ? Icon.Sun : Icon.Moon}
          actions={
            <ActionPanel>
              {status.active ? (
                <Action title="Turn Off" icon={Icon.Stop} onAction={disable} />
              ) : (
                <Action
                  title="Turn On Indefinitely"
                  icon={Icon.Play}
                  onAction={() => enable(undefined, "indefinite")}
                />
              )}
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title={status.active ? "Restart for…" : "Or enable for…"}>
        {DURATIONS.map((d) => (
          <List.Item
            key={d.label}
            title={d.label}
            icon={Icon.Clock}
            actions={
              <ActionPanel>
                <Action
                  title={`Caffeinate for ${d.label}`}
                  onAction={() => enable(d.seconds, d.label)}
                />
              </ActionPanel> 
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
