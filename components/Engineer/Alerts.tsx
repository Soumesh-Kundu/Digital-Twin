"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Check,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { useAlertStore, Alert, AlertType, AlertStatus } from "@/stores/alerts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Fetch } from "@/lib/customFetch/Fetch";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

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

interface AlertItemProps {
  alert: Alert;
  onResolve: (alert: Alert) => void;
  onUnresolve: (alert: Alert) => void;
  isLoading: boolean;
}

function AlertItem({
  alert,
  onResolve,
  onUnresolve,
  isLoading,
}: AlertItemProps) {
  const isPending = alert.status === "PENDING";

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
        {alert.resolvedBy && (
          <span>By: {alert.resolvedBy.name}</span>
        )}
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

      {/* Action Buttons */}
      {isPending && (
        <div className="pl-8 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
            onClick={() => onResolve(alert)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Mark Resolved
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
            onClick={() => onUnresolve(alert)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Mark Unresolved
          </Button>
        </div>
      )}
    </div>
  );
}

interface UnresolvedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}

function UnresolvedModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: UnresolvedModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for marking as unresolved");
      return;
    }
    onSubmit(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold">
          Mark as Unresolved
        </DialogTitle>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for marking this alert as unresolved:
          </p>
          <Textarea
            placeholder="Enter reason for unresolved status..."
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Alerts() {
  const { alerts, updateAlertStatus } = useAlertStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loadingAlertId, setLoadingAlertId] = useState<string | null>(null);

  const handleResolve = async (alert: Alert) => {
    setLoadingAlertId(alert.id);
    try {
      const response = await Fetch(`/alerts/${alert.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "RESOLVED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert");
      }

      updateAlertStatus(alert.id, "RESOLVED");
      toast.success("Alert marked as resolved");
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to update alert status");
    } finally {
      setLoadingAlertId(null);
    }
  };

  const handleUnresolveClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleUnresolveSubmit = async (reason: string) => {
    if (!selectedAlert) return;

    setLoadingAlertId(selectedAlert.id);
    try {
      const response = await Fetch(`/alerts/${selectedAlert.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "UNRESOLVED",
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert");
      }

      updateAlertStatus(selectedAlert.id, "UNRESOLVED", reason);
      toast.success("Alert marked as unresolved");
      setIsModalOpen(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error("Error updating alert:", error);
      toast.error("Failed to update alert status");
    } finally {
      setLoadingAlertId(null);
    }
  };

  const pendingAlerts = alerts.filter((a) => a.status === "PENDING");
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED");
  const unresolvedAlerts = alerts.filter((a) => a.status === "UNRESOLVED");

  return (
    <div className="flex flex-col h-full p-6 min-h-0">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and respond to machine alerts
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
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolve}
                  onUnresolve={handleUnresolveClick}
                  isLoading={loadingAlertId === alert.id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Unresolved Modal */}
      <UnresolvedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAlert(null);
        }}
        onSubmit={handleUnresolveSubmit}
        isLoading={loadingAlertId === selectedAlert?.id}
      />
    </div>
  );
}
