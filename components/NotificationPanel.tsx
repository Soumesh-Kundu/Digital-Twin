"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, AlertCircle, Check, Clock } from "lucide-react";
import { useAlertStore, Alert, AlertType, AlertStatus } from "@/stores/alerts";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function AlertIcon({ type }: { type: AlertType }) {
  if (type === "ERROR") {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const variants = {
    PENDING: {
      bg: "bg-amber-100 text-amber-800",
      icon: <Clock className="h-3 w-3" />,
      label: "Pending",
    },
    RESOLVED: {
      bg: "bg-green-100 text-green-800",
      icon: <Check className="h-3 w-3" />,
      label: "Resolved",
    },
    UNRESOLVED: {
      bg: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Unresolved",
    },
  };

  const variant = variants[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variant.bg
      )}
    >
      {variant.icon}
      {variant.label}
    </span>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
        !alert.seen && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-2">
        <AlertIcon type={alert.alertType} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug break-words">
            {alert.message}
          </p>
          {alert.machine?.name && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Machine: {alert.machine.name}
            </p>
          )}
        </div>
        {!alert.seen && (
          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={alert.status} />
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(new Date(alert.createdAt))}
        </span>
      </div>
    </div>
  );
}

export default function NotificationPanel() {
  const { alerts, markAllAsSeen, getUnseenCount } = useAlertStore();
  const [isOpen, setIsOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  // Update unseen count reactively
  useEffect(() => {
    setUnseenCount(getUnseenCount());
  }, [alerts, getUnseenCount]);

  // Mark all as seen when panel is opened
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Small delay to let user see the unseen indicators
      setTimeout(() => {
        markAllAsSeen();
      }, 500);
    }
  };

  // Get recent alerts (limit to 10 for the dropdown)
  const recentAlerts = alerts.slice(0, 10);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon"  className="relative">
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unseenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={() => markAllAsSeen()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px] overflow-auto">
          <div className="flex flex-col">
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </ScrollArea>
        {alerts.length > 10 && (
          <div className="p-2 border-t">
            <Link href="#"  className={`w-full text-sm ${buttonVariants({ variant: "ghost" ,size:"sm"})}`} >
              View all {alerts.length} notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
