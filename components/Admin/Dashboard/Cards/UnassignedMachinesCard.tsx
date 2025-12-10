"use client";

import { AlertTriangle, UserX } from "lucide-react";
import { MACHINE_TYPE, Machines, MachinesStatus } from "@prisma/client";

type Props = {
  machines: Machines[];
};

const machineTypeColors: Record<MACHINE_TYPE, string> = {
  CNC: "bg-blue-100 text-blue-700",
  HYDRAULIC: "bg-purple-100 text-purple-700",
  FURNACE: "bg-orange-100 text-orange-700",
  ROBOTIC_ARM: "bg-cyan-100 text-cyan-700",
};

const statusColors: Record<MachinesStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  IDLE: "bg-gray-100 text-gray-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};

function formatMachineType(type: MACHINE_TYPE) {
  return type.replace("_", " ").charAt(0) + type.replace("_", " ").slice(1).toLowerCase();
}

export default function UnassignedMachinesCard({ machines }: Props) {
  return (
    <div className="col-span-3 bg-white rounded-xl shadow-md border p-6 h-80 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <UserX className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Unassigned Machines</h3>
        {machines.length > 0 && (
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {machines.length}
          </span>
        )}
      </div>

      {machines.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 thin-scrollbar">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="p-3 rounded-lg border bg-red-50 border-red-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{machine.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${machineTypeColors[machine.type]}`}
                      >
                        {formatMachineType(machine.type)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[machine.status]}`}
                      >
                        {machine.status.charAt(0) + machine.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">
                    <UserX className="h-3 w-3" />
                    No Assignee
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <UserX className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-gray-500 font-medium">All machines assigned</p>
          <p className="text-gray-400 text-sm mt-1">Every machine has at least one assignee</p>
        </div>
      )}
    </div>
  );
}
