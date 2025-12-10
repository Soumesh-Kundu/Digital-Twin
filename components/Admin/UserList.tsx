"use client";
import { Role, User } from "@prisma/client";
import { Usable, use, useEffect } from "react";
import { Button } from "../ui/button";
import { Group, Pencil, Plus, Settings, Trash } from "lucide-react";
import { useUserModalStore } from "@/stores/userModal";
import UserModal from "../Modals/UserModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmationBox from "../Modals/ConfirmationBox";
import { useSession } from "next-auth/react";
import { Fetch } from "@/lib/customFetch/Fetch";
type ListUser = Omit<User, "password" | "createdAt" | "updatedAt">;
type Props = {
  users: Promise<ListUser[]>;
};
export default function AdminUserList({ users }: Props) {
  const { openAddModal, openEditModal } = useUserModalStore((state) => state);
  const userList = use(users);
  const router=useRouter();

  async function deleteUser(userId: string) {
    try {
      const res=await Fetch(`/users/${userId}`, {
        method: "DELETE",
      });
      const data=await res.json();
      if(!res.ok){
        throw new Error(data.error || "Failed to delete user");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user. Please try again.");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
        <Button
          className="flex items-center gap-1"
          onClick={() => openAddModal()}
        >
          <Plus />
          Add User
        </Button>
      </div>
      <div id="scrollable" className="flex flex-col gap-4 flex-1 mt-3 overflow-auto thin-scrollbar">
        <UserModal />
        {userList.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-5 p-5">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
                <span>Add Users to monitor and manage Digital Twins</span>
              </div>
              <Button onClick={() => openAddModal()}>Add People</Button>
            </div>
          </div>
        )}
        {userList.map((user) => (
          <div key={user.id} className="border shadow-md rounded-lg p-4 flex items-center gap-2">
            <div className="flex flex-col grow">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
                <span className=" text-gray-600 font-medium">
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" 
              onClick={()=>{openEditModal({
                id: user.id,
                name: user.name!,
                email: user.email,
                role: user.role as Extract<Role, "ENGINEER" | "MAINTENANCE">
              })}}
              >
                <Pencil />
              </Button>
              <ConfirmationBox
              onYes={async ()=>{
                await deleteUser(user.id);
              }}
              message={`Are you sure you want to delete user ${user.name}?`}
              >
              <Button variant="destructive">
                <Trash />
              </Button>
              </ConfirmationBox>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
