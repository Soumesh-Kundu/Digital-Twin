import AdminMachineList from "@/components/Admin/MachineList";
import { serverFetch } from "@/lib/customFetch/serverFetch";

async function getMachines(){
  try {
    const res=await serverFetch("/machines",{
        cache: 'no-store'
    });
    if(!res.ok){
      throw new Error("Failed to fetch machines");
    }
    const machines = await res.json();
    return machines;
  } catch (error) {
    console.log("Error fetching machines:", error);
    return [];
  }
}


export default async function page() {
  const machines = getMachines();
  return (
    <AdminMachineList machines={machines} />
  )
}
