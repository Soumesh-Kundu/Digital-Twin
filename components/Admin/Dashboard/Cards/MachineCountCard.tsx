"use client";

import { Cog } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { NumberTicker } from "@/components/ui/number-ticker";

type Props = {
  activeCount: number;
  idleCount: number;
  maintenanceCount: number;
};

const COLORS = {
  active: "#22c55e",      // Green
  idle: "#9ca3af",        // Gray
  maintenance: "#ef4444", // Red
};

export default function MachineCountCard({
  activeCount,
  idleCount,
  maintenanceCount,
}: Props) {
  const totalMachines = activeCount + idleCount + maintenanceCount;

  const data = [
    { name: "Active", value: activeCount, color: COLORS.active },
    { name: "Idle", value: idleCount, color: COLORS.idle },
    { name: "Maintenance", value: maintenanceCount, color: COLORS.maintenance },
  ];

  return (
    <div className="col-span-2 bg-white rounded-xl shadow-md border p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Cog className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Machines Overview</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number, name: string) => [`${value} machines`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-800">
              <NumberTicker value={totalMachines} />
            </span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 w-full">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS.active }}
              />
              <span className="text-xs text-gray-600">Active</span>
            </div>
            <span className="text-lg font-semibold text-green-500">
              <NumberTicker value={activeCount} delay={0.1} />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS.idle }}
              />
              <span className="text-xs text-gray-600">Idle</span>
            </div>
            <span className="text-lg font-semibold text-gray-500">
              <NumberTicker value={idleCount} delay={0.2} />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS.maintenance }}
              />
              <span className="text-xs text-gray-600">Maintenance</span>
            </div>
            <span className="text-lg font-semibold text-red-500">
              <NumberTicker value={maintenanceCount} delay={0.3} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
