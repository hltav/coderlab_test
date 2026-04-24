import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { NotificationState } from "../../types";

interface NotificationProps {
  notification: NotificationState | null;
}

export function Notification({ notification }: NotificationProps) {
  if (!notification) return null;

  const bgColor =
    notification.type === "error"
      ? "bg-red-600"
      : notification.type === "info"
        ? "bg-slate-800"
        : "bg-emerald-600";

  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 duration-300 z-100 text-white ${bgColor}`}
    >
      {notification.type === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <span className="font-medium text-sm">{notification.message}</span>
    </div>
  );
}
