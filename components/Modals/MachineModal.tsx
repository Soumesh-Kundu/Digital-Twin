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
import { set, z } from "zod";
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
import { MACHINE_TYPE, MachinesStatus } from "@prisma/client";
import { useMachineModalStore } from "@/stores/machineModal";
const createUserSchema = (modalType: "add" | "edit") =>
  z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    modelName: z
      .string()
      .refine((val) => /[A-Za-z0-9\-]+/.test(val), {
        message: "Must only contain letters, numbers, and hyphens",
      })
      .max(100, "Model name must be at most 100 characters"),
    type: z.enum(MACHINE_TYPE, { error: "Type is required" }),
    powerMax: z.number({ error: "Power Max must be a number" }),
    temperature: z
      .number({ error: "Temperature  must be a number" })
      .min(0, "Temperature  must be at least 0"),
    vibration: z
      .number({ error: "Vibration  must be a number" })
      .min(0, "Vibration  must be at least 0"),
    status: z.enum(MachinesStatus, { error: "Status is required" }),
    rpmMax: z
      .number({ error: "RPM Max must be a number" })
      .min(0, "RPM Max must be at least 0")
      .optional(),
    torqueMax: z
      .number({ error: "Torque Max must be a number" })
      .min(0, "Torque Max must be at least 0")
      .optional(),
    oiLPressureMax: z
      .number({ error: "Oil Pressure Max must be a number" })
      .min(0, "Oil Pressure Max must be at least 0")
      .optional(),
    oilLevelMax: z
      .number({ error: "Oil Level Max must be a number" })
      .min(0, "Oil Level Max must be at least 0")
      .optional(),
    motorCurrentMax: z
      .number({ error: "Motor Current Max must be a number" })
      .min(0, "Motor Current Max must be at least 0")
      .optional(),
    fuelFlowMax: z
      .number({ error: "Fuel Flow Max must be a number" })
      .min(0, "Fuel Flow Max must be at least 0")
      .optional(),
    pressureMax: z
      .number({ error: "Fuel Pressure Max must be a number" })
      .min(0, "Fuel Pressure Max must be at least 0")
      .optional(),
    exhaustTemperatureMax: z
      .number({ error: "Exhaust Temperature Max must be a number" })
      .min(0, "Exhaust Temperature Max must be at least 0")
      .optional(),
    joinTorqueMax: z
      .number({ error: "Joint Torque Max must be a number" })
      .min(0, "Joint Torque Max must be at least 0")
      .optional(),
    currentMax: z
      .number({ error: "Joint Temperature Max must be a number" })
      .min(0, "Joint Temperature Max must be at least 0")
      .optional(),
    cyclCountMax: z
      .number({ error: "Cycle Count Max must be a number" })
      .min(0, "Cycle Count Max must be at least 0")
      .optional(),
  });

const stringToEnumMap = {
  CNC: MACHINE_TYPE.CNC,
  HYDRAULIC: MACHINE_TYPE.HYDRAULIC,
  FURNACE: MACHINE_TYPE.FURNACE,
  ROBOTIC_ARM: MACHINE_TYPE.ROBOTIC_ARM,
};
const statusStringToEnumMap = {
  ACTIVE: MachinesStatus.ACTIVE,
  IDLE: MachinesStatus.IDLE,
  MAINTENANCE: MachinesStatus.MAINTENANCE,
};

const enumToParamsMap = {
  [MACHINE_TYPE.CNC]: ["powerMax", "rpmMax", "torqueMax"],
  [MACHINE_TYPE.HYDRAULIC]: [
    "pressureMax",
    "flowRateMax",
    "oilLevelMax",
    "oilTemperatureMax",
    "motorCurrentMax",
  ],
  [MACHINE_TYPE.FURNACE]: [
    "pressureMax",
    "fuelFlowMax",
    "exhaustTemperatureMax",
  ],
  [MACHINE_TYPE.ROBOTIC_ARM]: ["jointTorqueMax", "currentMax", "cycleCountMax"],
};

export default function MachineModal() {
  const {
    isMachineModalOpen,
    reset,
    type: modalType,
    data: { id: machineId },
  } = useMachineModalStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<MACHINE_TYPE | undefined>(undefined);
  const router = useRouter();

  const [isPasswordLock, setIsPasswordLock] = useState(modalType === "edit");
  const userSchema = createUserSchema(modalType);
  const form = useForm({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    console.log("Modal Type Changed:", modalType);
    setIsPasswordLock(modalType === "edit");
    form.reset();
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
        body: JSON.stringify({ id: machineId, ...userData }),
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
      open={isMachineModalOpen}
      onOpenChange={(e) => {
        if (!e) {
          form.reset();
          reset();
          setType(undefined);
        }
      }}
    >
      <DialogContent className="max-w-2xl!">
        <DialogTitle>User Details</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-3 gap-5 "
          >
            <FormField
              control={form.control}
              name="name"
              render={() => (
                <FormItem className="col-span-3">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...form.register("name")} placeholder="Machine name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelName"
              render={() => (
                <FormItem className="">
                  <FormLabel>Model Name</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("modelName")}
                      placeholder="Model X"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={() => (
                <FormItem className="">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("type")}
                      onValueChange={(value) => {
                        if (!value) form.resetField("type");
                        form.setValue(
                          "type",
                          stringToEnumMap[value as keyof typeof stringToEnumMap]
                        );
                        setType(
                          stringToEnumMap[value as keyof typeof stringToEnumMap]
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MACHINE_TYPE).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={() => (
                <FormItem className="">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("status")}
                      onValueChange={(value) => {
                        if (!value) form.resetField("status");
                        form.setValue(
                          "status",
                          statusStringToEnumMap[
                            value as keyof typeof statusStringToEnumMap
                          ]
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MachinesStatus).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {enumToParamsMap[form.getValues("type")]?.map((param) => (
              <FormField
                key={param}
                control={form.control}
                name={param as any}
                render={() => (
                  <FormItem className="">
                    <FormLabel>
                      {param
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...form.register(param as any)}
                        placeholder={`Enter ${param}`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <div className="flex items-center justify-end col-span-3 gap-4">
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
