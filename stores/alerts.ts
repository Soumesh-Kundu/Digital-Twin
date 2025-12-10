import { create } from "zustand";

// Define Alert types locally (matching backend schema)
export type AlertType = "WARNING" | "ERROR";
export type AlertStatus = "PENDING" | "RESOLVED" | "UNRESOLVED";

// Alert type from DB (matches getAlertsForUser response)
export interface Alert {
  id: string;
  machineId: string;
  alertType: AlertType;
  message: string;
  status: AlertStatus;
  resolvedById: string | null;
  resolvedAt: Date | null;
  reason: string | null;
  createdAt: Date;
  machine: {
    id: string;
    name: string;
    model_name: string;
  } | null;
  resolvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  // Frontend-only field for tracking read state
  seen: boolean;
}

// Socket alert payload (matches DB response structure)
export interface SocketAlertPayload {
  id: string;
  machineId: string;
  alertType: AlertType;
  message: string;
  status: AlertStatus;
  resolvedById: string | null;
  resolvedAt: string | null;
  reason: string | null;
  createdAt: string;
  machine: {
    id: string;
    name: string;
    model_name: string;
  } | null;
  resolvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface AlertState {
  alerts: Alert[];
  isInitialized: boolean;
  pendingCount: number;
}

interface AlertActions {
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAllAsSeen: () => void;
  markAlertAsSeen: (id: string) => void;
  updateAlertStatus: (id: string, status: AlertStatus, reason?: string) => void;
  setInitialized: (value: boolean) => void;
  getUnseenCount: () => number;
}

export const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  alerts: [],
  isInitialized: false,
  pendingCount: 0,

  setAlerts: (alerts) =>
    set({
      alerts,
      pendingCount: alerts.filter((a) => a.status === "PENDING").length,
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      pendingCount:
        alert.status === "PENDING"
          ? state.pendingCount + 1
          : state.pendingCount,
    })),

  markAllAsSeen: () =>
    set((state) => ({
      alerts: state.alerts.map((alert) => ({ ...alert, seen: true })),
    })),

  markAlertAsSeen: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, seen: true } : alert
      ),
    })),

  updateAlertStatus: (id, status, reason) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id);
      const wasPending = alert?.status === "PENDING";
      const isNowPending = status === "PENDING";

      let newPendingCount = state.pendingCount;
      if (wasPending && !isNowPending) {
        newPendingCount--;
      } else if (!wasPending && isNowPending) {
        newPendingCount++;
      }

      return {
        alerts: state.alerts.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                reason: reason ?? a.reason,
                resolvedAt:
                  status === "RESOLVED" || status === "UNRESOLVED"
                    ? new Date()
                    : a.resolvedAt,
              }
            : a
        ),
        pendingCount: newPendingCount,
      };
    }),

  setInitialized: (value) => set({ isInitialized: value }),

  getUnseenCount: () => get().alerts.filter((alert) => !alert.seen).length,
}));
