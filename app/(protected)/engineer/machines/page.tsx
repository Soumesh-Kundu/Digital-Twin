import EngineerMachineList from "@/components/Engineer/Machineslist";
import { serverFetch } from "@/lib/customFetch/serverFetch";

async function getMachines(){
  try {
    const res=await serverFetch("/assignements/my-machines",{
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

export default function page() {
  const machinesPromise = getMachines();
  return (
    <EngineerMachineList machines={machinesPromise} />
  )
}
