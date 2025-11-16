import AdminUserList from "@/components/Admin/UserList";
import { serverFetch } from "@/lib/customFetch/serverFetch";

const dynamic = 'force-dynamic';

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

export default async function page() {
  const usersPromise = getUsers();
  return <AdminUserList users={usersPromise} />;
}
