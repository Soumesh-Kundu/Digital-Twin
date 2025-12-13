import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import AlertWrapper from "@/components/AlertWrapper";
import { getServerUser } from "@/lib/server/auth";
import { serverFetch } from "@/lib/customFetch/serverFetch";

async function getAlerts() {
  try {
    const res = await serverFetch("/alerts?pageSize=10", {
      cache: "no-store",
    });
    const alerts = await res.json();
    return alerts;
  } catch (error) {
    console.log("Error fetching alerts:", error);
    return {
      data: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0, pending: 0},
    };
  }
}

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

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerUser();
  const alertsPromise = getAlerts();
  const assignedMachines = await getMachines();
  
  return (
    <div className="w-screen h-screen flex flex-col">
      <SessionWrapper>
        <AlertWrapper
          alertsPromise={alertsPromise}
          assignedMachines={assignedMachines}
        >
          <Navbar userName={session?.user?.name || "Guest"} />
          {children}
        </AlertWrapper>
      </SessionWrapper>
    </div>
  );
}

