"use client";

import {
  AlertTriangle,
  AlertCircle,
  Check,
  Clock,
  X,
} from "lucide-react";
import { useAlertStore, Alert, AlertType, AlertStatus } from "@/stores/alerts";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AlertIcon({ type }: { type: AlertType }) {
  if (type === "ERROR") {
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
  return <AlertTriangle className="h-5 w-5 text-amber-500" />;
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const variants = {
    PENDING: {
      bg: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Pending",
    },
    RESOLVED: {
      bg: "bg-green-100 text-green-800 border-green-200",
      icon: <Check className="h-3.5 w-3.5" />,
      label: "Resolved",
    },
    UNRESOLVED: {
      bg: "bg-red-100 text-red-800 border-red-200",
      icon: <X className="h-3.5 w-3.5" />,
      label: "Unresolved",
    },
  };

  const variant = variants[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
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
    <div className="flex flex-col gap-3 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertIcon type={alert.alertType} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {alert.alertType === "ERROR" ? "Failure Alert" : "Warning Alert"}
            </p>
            {alert.machine?.name && (
              <p className="text-xs text-muted-foreground">
                Machine: {alert.machine.name} ({alert.machine.model_name})
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={alert.status} />
      </div>

      {/* Message */}
      <div className="pl-8">
        <p className="text-sm text-foreground leading-relaxed">
          {alert.message}
        </p>
      </div>

      {/* Metadata */}
      <div className="pl-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Created: {formatDate(new Date(alert.createdAt))}</span>
        {alert.resolvedAt && (
          <span>
            {alert.status === "RESOLVED" ? "Resolved" : "Updated"}:{" "}
            {formatDate(new Date(alert.resolvedAt))}
          </span>
        )}
        {alert.resolvedBy && <span>By: {alert.resolvedBy.name}</span>}
      </div>

      {/* Reason (if unresolved) */}
      {alert.status === "UNRESOLVED" && alert.reason && (
        <div className="pl-8">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
              Unresolved Reason:
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              {alert.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Alerts() {
  const { alerts } = useAlertStore();

  const pendingAlerts = alerts.filter((a) => a.status === "PENDING");
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED");
  const unresolvedAlerts = alerts.filter((a) => a.status === "UNRESOLVED");

  return (
    <div className="flex flex-col h-full p-6 min-h-0">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View machine alerts and their status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">
            {pendingAlerts.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              Resolved
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
            {resolvedAlerts.length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              Unresolved
            </span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
            {unresolvedAlerts.length}
          </p>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 border rounded-lg bg-card overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No alerts</p>
              <p className="text-sm">All systems are running smoothly</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
