"use client";
import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Fetch } from "@/lib/customFetch/Fetch";
import { Button } from "../ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { Circle, CircleCheckIcon } from "lucide-react";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isAssigned: boolean;
};

type Props = {
  children: React.ReactNode;
  machineId: string;
};

export default function MachineAsignee({ children, machineId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetched = useRef(false);
  const router=useRouter();


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both assignees and all users in parallel
      const [assigneesRes, usersRes] = await Promise.all([
        Fetch(`/assignements/machine-assignees?machineId=${machineId}`),
        Fetch(`/users`),
      ]);

      if (assigneesRes.ok && usersRes.ok) {
        const assignees = await assigneesRes.json();
        const allUsers = await usersRes.json();

        // Create a Set of assigned user IDs for quick lookup
        const assignedIds = new Set(assignees.map((a: { id: string }) => a.id));

        // Mark users as assigned or not and store only assigned status
        const usersWithAssignment: User[] = allUsers.map(
          (user: Omit<User, "isAssigned">) => ({
            ...user,
            isAssigned: assignedIds.has(user.id),
          })
        );

        setUsers(usersWithAssignment);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [machineId]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Only fetch on first open
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  };


  const toggleAssignment = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isAssigned: !user.isAssigned } : user
      )
    );
  };

  const onSave = async () => {
    // Get only assigned user IDs
    if (isSubmitting) return;
    setIsSubmitting(true);
    const assignedUserIds = users.filter((u) => u.isAssigned).map((u) => u.id);

    try {
      const res = await Fetch(`/assignements/update`, {
        method: "POST",
        body: JSON.stringify({ machineId, userIds: assignedUserIds }),
      });
      if (!res.ok) {
        throw new Error("Failed to update assignments");
      }
      handleOpenChange(false);
      setTimeout(()=>{ 
          fetchData().then(()=>{});
      },500)
    } catch (error) {
      console.error("Error saving:", error);
    }
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle hidden></DialogTitle>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-5  max-h-[70vh] overflow-auto thin-scrollbar">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 border-b rounded cursor-pointer"
                  onClick={() => toggleAssignment(user.id)}
                >
                  <div className="h-8 w-8 flex items-center justify-center">
                    {user.isAssigned ? (
                      <CircleCheckIcon fill="black" stroke="white" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </div>
                  <span>{user.name}</span>
                  <span className="text-gray-500 text-sm">({user.role})</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center">
            <Button onClick={onSave} className="w-24">{
                isSubmitting ? <Ring size={20} color="white" stroke={1.5} /> : "Save"
                }</Button>
            <DialogClose asChild>
              <Button
              disabled={isSubmitting}
                variant="outline"
                className="ml-2 w-24"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
