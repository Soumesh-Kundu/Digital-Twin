"use client";

import { MACHINE_TYPE, MachinesStatus } from "@prisma/client";
import { use, useMemo } from "react";
import KPICard from "./Cards/KPICard";
import MachineCard from "./Cards/MachineCard";

type Machine = {
  id: string;
  name: string;
  model_name: string;
  type: MACHINE_TYPE;
  status: MachinesStatus;
  temperature_max: number;
  vibration_max: number;
  power_max: number;
  thresholds: Record<string, number> | null;
};

type Props = {
  machinesPromise: Promise<Machine[]>;
};

export default function Dashboard({ machinesPromise }: Props) {
  const machines = use(machinesPromise);

  const [activeCount, idleCount, maintenanceCount] = useMemo(() => {
    let active = 0;
    let idle = 0;
    let maintenance = 0;

    machines.forEach((machine) => {
      if (machine.status === "ACTIVE") {
        active++;
      } else if (machine.status === "IDLE") {
        idle++;
      } else if (machine.status === "MAINTENANCE") {
        maintenance++;
      }
    });

    return [active, idle, maintenance];
  }, [machines]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <KPICard
        alertsCount={0}
        activeCount={activeCount}
        idleCount={idleCount}
        maintenanceCount={maintenanceCount}
        totalMachines={machines.length}
      />
      
      {/* Machine Cards */}
      {machines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
}
