"use client";

import { NumberTicker } from "@/components/ui/number-ticker";
import {
  AlertTriangle,
  Activity,
  Pause,
  Wrench,
  Server,
} from "lucide-react";

type Props = {
  alertsCount: number;
  activeCount: number;
  idleCount: number;
  maintenanceCount: number;
  totalMachines: number;
};

export default function KPICard({
  alertsCount,
  activeCount,
  idleCount,
  maintenanceCount,
  totalMachines,
}: Props) {
  return (
    <div className="col-span-3 bg-white rounded-xl shadow-md border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Server className="h-4 w-4 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-800">Machine Overview</h3>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {/* Total Machines */}
        <div className="flex flex-col items-center justify-center p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-500 mb-2">
            <Server className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-600">
            <NumberTicker value={totalMachines} />
          </span>
          <span className="text-xs text-gray-600 mt-0.5">Total</span>
        </div>

        {/* Active Machines */}
        <div className="flex flex-col items-center justify-center p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-green-500 mb-2">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-green-600">
            <NumberTicker value={activeCount} delay={0.1} />
          </span>
          <span className="text-xs text-gray-600 mt-0.5">Active</span>
        </div>

        {/* Idle Machines */}
        <div className="flex flex-col items-center justify-center p-3 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-500 mb-2">
            <Pause className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-600">
            <NumberTicker value={idleCount} delay={0.2} />
          </span>
          <span className="text-xs text-gray-600 mt-0.5">Idle</span>
        </div>

        {/* Maintenance Machines */}
        <div className="flex flex-col items-center justify-center p-3 bg-linear-to-br from-amber-50 to-amber-100 rounded-lg">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-500 mb-2">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-amber-600">
            <NumberTicker value={maintenanceCount} delay={0.3} />
          </span>
          <span className="text-xs text-gray-600 mt-0.5">Maintenance</span>
        </div>

        {/* Alerts */}
        <div className="flex flex-col items-center justify-center p-3 bg-linear-to-br from-red-50 to-red-100 rounded-lg">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-red-500 mb-2">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-red-600">
            <NumberTicker value={alertsCount} delay={0.4} />
          </span>
          <span className="text-xs text-gray-600 mt-0.5">Alerts</span>
        </div>
      </div>
    </div>
  );
}
