"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUserModalStore } from "@/stores/userModal";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Eye, EyeClosed, Pencil } from "lucide-react";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
const createUserSchema = (modalType: "add" | "edit") =>
  z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"), 
    email: z.email("Invalid email address"),
    role: z.enum(Role, {
      error: "Role is required",
    }),
    password: modalType === "add"
      ? z
          .string()
          .min(6, "Password must be at least 6 characters")
          .max(100, "Password must be at most 100 characters")
      : z.string().max(100, "Password must be at most 100 characters").optional(),  
  });

export default function UserModal() {
  const {
    isUserModalOpen,
    reset,
    type: modalType,
    data: { id: userId },
  } = useUserModalStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [isPasswordLock, setIsPasswordLock] = useState(modalType === "edit");
  const userSchema = createUserSchema(modalType);
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: modalType === "edit" ? useUserModalStore.getState().data.name : "",
      email:
        modalType === "edit" ? useUserModalStore.getState().data.email : "",
      role:
        modalType === "edit"
          ? useUserModalStore.getState().data.role
          : undefined,
      password: "",
    },
  });

  useEffect(() => {
    console.log("Modal Type Changed:", modalType);
    setIsPasswordLock(modalType === "edit");
    form.reset({
      name: modalType === "edit" ? useUserModalStore.getState().data.name : "",
      email:
        modalType === "edit" ? useUserModalStore.getState().data.email : "",
      role:
        modalType === "edit"
          ? useUserModalStore.getState().data.role
          : undefined,
      password: "",
    });
  }, [modalType]);

  async function handleSubmit() {
    if (isLoading) return;
    setIsLoading(true);
    if (modalType === "add") {
      await createUser();
    } else {
      await updateUser();
    }
    setIsLoading(false);
  }

  async function createUser() {
    try {
      const userData = form.getValues();
      const res = await fetch(`/api/users/create`, {
        method: "POST",
        body: JSON.stringify(userData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json);
      }
      reset();
      router.refresh();
    } catch (error) {
      toast.error("Failed to create user. Please try again.");
      console.log(error);
    }
  }

  async function updateUser() {
    try {
      const userData = form.getValues();
      const res = await fetch(`/api/users/update`, {
        method: "PUT",
        body: JSON.stringify({ id: userId, ...userData }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json);
      }
      reset();
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
      console.log(error);
    }
  }

  return (
    <Dialog
      open={isUserModalOpen}
      onOpenChange={(e) => {
        if (!e) {
          form.reset();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-xl!">
        <DialogTitle>User Details</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-2 gap-5 "
          >
            <FormField
              control={form.control}
              name="name"
              render={() => (
                <FormItem className="col-span-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...form.register("name")} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("email")}
                      placeholder="johndoe@exmaple.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={() => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("role")}
                      onValueChange={(value) => {
                        if (!value) form.resetField("role");
                        form.setValue(
                          "role",
                          value === "ENGINEER" ? "ENGINEER" : "MAINTENANCE"
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENGINEER">Engineer</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={() => (
                <FormItem className="col-span-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        readOnly={isPasswordLock}
                        type={showPassword ? "text" : "password"}
                        {...form.register("password")}
                        placeholder="********"
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
                        onClick={() => {
                          if (isPasswordLock) {
                            setIsPasswordLock(false);
                            return;
                          }
                          setShowPassword((prev) => !prev);
                        }}
                      >
                        {!isPasswordLock ? (
                          showPassword ? (
                            <Eye />
                          ) : (
                            <EyeClosed />
                          )
                        ) : (
                          <span className="flex items-center gap-1 text-sm  hover:underline">
                            <Pencil size={16} />
                            <span>Change Password</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end col-span-2 gap-4">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} className="mr-2">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="w-24">
                {isLoading ? (
                  <Ring color="white" size={20} stroke={1.5} />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
