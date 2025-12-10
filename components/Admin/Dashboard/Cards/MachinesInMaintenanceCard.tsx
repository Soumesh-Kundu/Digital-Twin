"use client";

import { Wrench } from "lucide-react";
import { MACHINE_TYPE, Machines } from "@prisma/client";

type Props = {
  machines: Machines[];
};

const machineTypeColors: Record<MACHINE_TYPE, string> = {
  CNC: "bg-blue-100 text-blue-700",
  HYDRAULIC: "bg-purple-100 text-purple-700",
  FURNACE: "bg-orange-100 text-orange-700",
  ROBOTIC_ARM: "bg-cyan-100 text-cyan-700",
};

function formatMachineType(type: MACHINE_TYPE) {
  return type.replace("_", " ").charAt(0) + type.replace("_", " ").slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getDaysInMaintenance(date: Date) {
  const now = new Date();
  const updatedAt = new Date(date);
  const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function MachinesInMaintenanceCard({ machines }: Props) {
  return (
    <div className="col-span-3 bg-white rounded-xl shadow-md border p-6 h-80 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Machines In Maintenance</h3>
        {machines.length > 0 && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {machines.length}
          </span>
        )}
      </div>

      {machines.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {machines.map((machine) => {
            const daysInMaintenance = getDaysInMaintenance(machine.updatedAt);
            return (
              <div
                key={machine.id}
                className="p-3 rounded-lg border bg-amber-50 border-amber-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100">
                      <Wrench className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{machine.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${machineTypeColors[machine.type]}`}
                        >
                          {formatMachineType(machine.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-700">
                      {daysInMaintenance} day{daysInMaintenance !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Since {formatDate(machine.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Wrench className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-gray-500 font-medium">All machines operational</p>
          <p className="text-gray-400 text-sm mt-1">No machines currently in maintenance</p>
        </div>
      )}
    </div>
  );
}
