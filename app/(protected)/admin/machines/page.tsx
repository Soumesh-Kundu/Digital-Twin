import AdminMachineList from "@/components/Admin/MachineList";
import { db } from "@/lib/server/db"

async function getMachines(){
    const machines=await db.machines.findMany({
        select:{
            id:true,
            name:true,
            model_name:true,
            type:true,
            power_max:true,
            status:true,
            temperature_max:true,
            vibration_max:true,
            thresholds:true,
            createdAt:true,
            updatedAt:true,
        },
        orderBy:{
            createdAt:"desc"
        }
    })
    return machines;
}


export default async function page() {
  const machines = getMachines();
  return (
    <AdminMachineList machines={machines} />
  )
}
