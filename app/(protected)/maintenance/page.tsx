import Dashboard from "@/components/Dashboard";
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

export default function MaintenancePage() {
  const machines=getMachines();
  return <Dashboard machinesPromise={machines} />;
}