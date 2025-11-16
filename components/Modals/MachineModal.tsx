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
import { Fetch } from "@/lib/customFetch/Fetch";
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
    powerMax: z.coerce.number().min(0, "Power Max must be at least 0"),
    temperature: z.coerce.number().min(0, "Temperature must be at least 0"),
    vibration: z.coerce.number().min(0, "Vibration must be at least 0"),
    status: z.enum(MachinesStatus, { error: "Status is required" }),
    rpmMax: z.coerce.number().min(0, "RPM Max must be at least 0").optional(),
    torqueMax: z.coerce.number().min(0, "Torque Max must be at least 0").optional(),
    oiLPressureMax: z.coerce.number().min(0, "Oil Pressure Max must be at least 0").optional(),
    oilLevelMax: z.coerce.number().min(0, "Oil Level Max must be at least 0").optional(),
    motorCurrentMax: z.coerce.number().min(0, "Motor Current Max must be at least 0").optional(),
    fuelFlowMax: z.coerce.number().min(0, "Fuel Flow Max must be at least 0").optional(),
    pressureMax: z.coerce.number().min(0, "Fuel Pressure Max must be at least 0").optional(),
    exhaustTemperatureMax: z.coerce.number().min(0, "Exhaust Temperature Max must be at least 0").optional(),
    joinTorqueMax: z.coerce.number().min(0, "Joint Torque Max must be at least 0").optional(),
    currentMax: z.coerce.number().min(0, "Joint Temperature Max must be at least 0").optional(),
    cyclCountMax: z.coerce.number().min(0, "Cycle Count Max must be at least 0").optional(),
    flowRateMax: z.coerce.number().min(0, "Flow Rate Max must be at least 0").optional(),
    oilTemperatureMax: z.coerce.number().min(0, "Oil Temperature Max must be at least 0").optional(),
    jointTorqueMax: z.coerce.number().min(0, "Joint Torque Max must be at least 0").optional(),
    cycleCountMax: z.coerce.number().min(0, "Cycle Count Max must be at least 0").optional(),
  });

type MachineFormData = z.infer<typeof createUserSchema>;

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
  [MACHINE_TYPE.CNC]: ["rpmMax", "torqueMax"],
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
    defaultValues: {
      name: modalType === "edit" ? useMachineModalStore.getState().data.name : "",
      modelName: modalType === "edit" ? useMachineModalStore.getState().data.model_name : "",
      type: modalType === "edit" ? useMachineModalStore.getState().data.type : undefined,
      status: modalType === "edit" ? useMachineModalStore.getState().data.status : undefined,
      powerMax: modalType === "edit" ? useMachineModalStore.getState().data.power_max || 0 : 0,
      temperature: modalType === "edit" ? useMachineModalStore.getState().data.temperature_max : 0,
      vibration: modalType === "edit" ? useMachineModalStore.getState().data.vibration_max : 0,
    },
  });

  useEffect(() => {
    console.log("Modal Type Changed:", modalType);
    setIsPasswordLock(modalType === "edit");
    const machineData = useMachineModalStore.getState().data;
    
    if (modalType === "edit") {
      setType(machineData.type);
      form.reset({
        name: machineData.name,
        modelName: machineData.model_name,
        type: machineData.type,
        status: machineData.status,
        powerMax: machineData.power_max || 0,
        temperature: machineData.temperature_max,
        vibration: machineData.vibration_max,
        // Populate threshold values if they exist
        ...(typeof machineData.thresholds === 'object' && machineData.thresholds !== null 
          ? machineData.thresholds as Record<string, number>
          : {})
      });
    } else {
      setType(undefined);
      form.reset({
        name: "",
        modelName: "",
        type: undefined,
        status: undefined,
        powerMax: 0,
        temperature: 0,
        vibration: 0,
      });
    }
  }, [modalType]);

  async function handleSubmit() {
    if (isLoading) return;
    setIsLoading(true);
    if (modalType === "add") {
      await createMachine();
    } else {
      await updateMachine();
    }
    setIsLoading(false);
  }

  async function createMachine() {
    try {
      const machineData = form.getValues();
      const data={
        name: machineData.name,
        model_name: machineData.modelName,
        type: machineData.type,
        status: machineData.status,
        power_max: Number(machineData.powerMax),
        temperature_max: Number(machineData.temperature),
        vibration_max: Number(machineData.vibration),
        thresholds: enumToParamsMap[machineData.type] 
        ?.reduce((acc, param) => {
          const value = machineData[param as keyof typeof machineData];
          acc[param] = value as string;
          return acc;
        }, {} as Record<string, string>)
      }

      console.log("Creating machine with data:", data,machineData['rpmMax']);
      const res = await Fetch(`/machines`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json);
      }
      form.reset();
      reset();
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      toast.error("Failed to create machine. Please try again.");
      console.log(error);
    }
  }

  async function updateMachine() {
    try {
      const machineData = form.getValues();
      const data={
        name: machineData.name,
        model_name: machineData.modelName,
        type: machineData.type,
        status: machineData.status,
        power_max: Number(machineData.powerMax),
        temperature_max: Number(machineData.temperature),
        vibration_max: Number(machineData.vibration),
        thresholds: enumToParamsMap[machineData.type] 
        ?.reduce((acc, param) => {
          const value = machineData[param as keyof typeof machineData];
          acc[param] = Number(value);
          return acc;
        }, {} as Record<string, number>)
      }

      const res = await Fetch(`/machines/${machineId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json);
      }
      form.reset();
      reset();
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      toast.error("Failed to update machine. Please try again.");
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
                    <Input
                      {...form.register("name")}
                      placeholder="Machine name"
                    />
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
                      value={form.watch("type") || ""}
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
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MACHINE_TYPE).map((type) => (
                          <SelectItem key={type} value={type}>
                            {(type.charAt(0) + type.slice(1).toLowerCase()).replace("_", " ")}
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
                      value={form.watch("status") || ""}
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
                        <SelectValue placeholder="Select a Status" />
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
            {
              ["powerMax", "temperature", "vibration"].map((param) => (
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
                  <FormMessage />
                </FormItem>
                  )}
                />
              ))
            }
            {form.getValues('type') && enumToParamsMap[form.getValues('type')]?.map((param) => (
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
                    <FormMessage />
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
