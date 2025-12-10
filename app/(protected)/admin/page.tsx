import Dashboard from "@/components/Admin/Dashboard";
import { serverFetch } from "@/lib/customFetch/serverFetch";

async function getUsers() {
  try {
    const res = await serverFetch("/users",{
        cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }
    const users = await res.json();
    console.log("Fetched users:", users);
    return users;
  } catch (error) {
    console.log("Error fetching users:", error);
    return [];
  }
}

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
async function getRecentAssignments(){
  try {
    const res=await serverFetch("/assignements/recent",{
        cache: 'no-store'
    });
    if(!res.ok){
        console.log("Failed to fetch recent assignments:", await res.text());
      throw new Error("Failed to fetch machines");
    }
    const machines = await res.json();
    return machines;
  } catch (error) {
    console.log("Error fetching machines:", error);
    return [];
  }
}

export default function AdminPage() {
    const users=getUsers();
    const machines=getMachines();
    const recentAssignments=getRecentAssignments();
    return <Dashboard users={users} machines={machines} assignees={recentAssignments} />;
}