"use client";

import { MACHINE_TYPE, Machines, Role, User } from "@prisma/client";
import { use, useMemo } from "react";
import UsersCountCard from "./Cards/UsersCountCard";
import MachineCountCard from "./Cards/MachineCountCard";
import RecentAlertsCard from "./Cards/RecentAlertsCard";
import RecentAssignmentsCard from "./Cards/RecentAssignmentsCard";
import MachinesInMaintenanceCard from "./Cards/MachinesInMaintenanceCard";
import UnassignedMachinesCard from "./Cards/UnassignedMachinesCard";

type Props = {
  users: Promise<User[]>;
  machines: Promise<(Machines & { _count?: { assignements?: number } })[]>;
  assignees:Promise<{
    id: string;
    assignedAt: Date;
    machine: {
        id: string;
        name: string;
        type: MACHINE_TYPE;
    };
    user: {
        id: string;
        name: string;
    };
}[]>; // Adjust type as necessary
};
export default function Dashboard({
  users: userPromise,
  machines: machinesPromise,
  assignees: assigneesPromise,
}: Props) {
  const users = use(userPromise);
  const machines = use(machinesPromise);
  const assignees = use(assigneesPromise);
 
  const [engineersCount,maintainerCount]=useMemo(()=>{
    let engineers=0;
    let maintainers=0;
    users.forEach((user)=>{
      if(user.role===Role.ENGINEER){
        engineers++;
      }else if(user.role===Role.MAINTENANCE){
        maintainers++;
      }
    });
    return [engineers, maintainers];
  },[users]);
  const [activeCount,idleCount,maintenanceCount,machineInMaintainance, notAssignedMachines]=useMemo(()=>{
    let active=0;
    let idle=0;
    let maintenance=0;
    const machineInMaintainance:Machines[]=[];
    const notAssignedMachines:Machines[]=[];
    machines.forEach((machine)=>{
        if(machine.status==='ACTIVE'){
            active++;
        }else if(machine.status==='IDLE'){
            idle++;
        }else if(machine.status==='MAINTENANCE'){
            maintenance++;
            machineInMaintainance.push(machine);
        }
        if(!machine._count?.assignements){
            notAssignedMachines.push(machine);
        }
    });
    return [active, idle, maintenance,machineInMaintainance, notAssignedMachines];
    },[machines]);
  return <div className="grid grid-cols-6 gap-4 ">
    <UsersCountCard engineersCount={engineersCount} maintainerCount={maintainerCount} />
    <MachineCountCard activeCount={activeCount} idleCount={idleCount} maintenanceCount={maintenanceCount} />
    <RecentAlertsCard />
    <RecentAssignmentsCard assignments={assignees} />
    <MachinesInMaintenanceCard machines={machineInMaintainance} />
    <UnassignedMachinesCard machines={notAssignedMachines} />
  </div>;
}
