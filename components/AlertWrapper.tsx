"use client";

import { use, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  useAlertStore,
  Alert,
  SocketAlertPayload,
} from "@/stores/alerts";
import { useSocketStore } from "@/stores/socket";
import { Role } from "@prisma/client";

interface AssignedMachine {
  id: string;
  name: string;
}

interface AlertWrapperProps {
  alertsPromise: Promise<{
    data: Alert[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      pending: number;
    };
  }>;
  assignedMachines: AssignedMachine[];
  children: React.ReactNode;
}

export default function AlertWrapper({
  alertsPromise,
  assignedMachines,
  children,
}: AlertWrapperProps) {
  const { data: alertsData } = use(alertsPromise);
  const { data: session } = useSession();
  const { setAlerts, addAlert, isInitialized, setInitialized } = useAlertStore();
  const { socket, isConnected, connect, subscribeToMachines } = useSocketStore();
  const hasSubscribed = useRef(false);

  // Initialize alerts from server data
  useEffect(() => {
    if (session?.user && !isInitialized) {
      // Map DB response to Alert with seen field and proper date types
      const alertsWithSeen: Alert[] = alertsData.map((alert: any) => ({
        ...alert,
        seen: true, // Initial alerts are marked as seen
        createdAt: new Date(alert.createdAt),
        resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
      }));
      setAlerts(alertsWithSeen);
      setInitialized(true);
    }
  }, [session, isInitialized, alertsData, setAlerts, setInitialized]);

  // Connect socket once on mount, disconnect on unmount
  useEffect(() => {
    if (session?.user) {
      connect();
    }
    
    // Cleanup: disconnect socket when component unmounts (e.g., logout)
    return () => {
      // Note: We don't disconnect here normally because AlertWrapper
      // stays mounted. The beforeunload handler handles tab close.
    };
  }, [session, connect]);

  // Subscribe to all assigned machines once connected
  useEffect(() => {
    if (isConnected && assignedMachines.length > 0 && !hasSubscribed.current) {
      const isAdmin = session?.user?.role === Role.ADMIN;
      subscribeToMachines(assignedMachines, isAdmin);
      hasSubscribed.current = true;
    }
  }, [isConnected, assignedMachines, subscribeToMachines, session]);

  // Listen for machine_alert events globally
  useEffect(() => {
    if (!socket) return;

    const handleAlert = (payload: SocketAlertPayload) => {

      const newAlert: Alert = {
        id: payload.id,
        machineId: payload.machineId,
        alertType: payload.alertType,
        message: payload.message,
        status: payload.status,
        resolvedById: payload.resolvedById,
        resolvedBy: payload.resolvedBy,
        resolvedAt: payload.resolvedAt ? new Date(payload.resolvedAt) : null,
        reason: payload.reason,
        createdAt: new Date(payload.createdAt),
        seen: false, // New alerts from socket are unseen
        machine: payload.machine,
      };

      addAlert(newAlert);
    };

    socket.on("machine_alert", handleAlert);

    return () => {
      socket.off("machine_alert", handleAlert);
    };
  }, [socket, addAlert]);

  return <>{children}</>;
}
