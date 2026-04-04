export function isSupported(): boolean {
  return typeof Notification !== "undefined";
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string): void {
  if (!isSupported()) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}
