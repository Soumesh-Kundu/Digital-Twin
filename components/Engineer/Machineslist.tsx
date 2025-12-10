"use client";
import { MACHINE_TYPE, MachinesStatus } from "@prisma/client";
import { use, useState } from "react";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";

type Machine = {
  id: string;
  name: string;
  model_name: string;
  type: MACHINE_TYPE;
  status: MachinesStatus;
  temperature_max: number;
  vibration_max: number;
  power_max: number;
  thresholds: Record<string, number> | null;
};

type Props = {
  machines: Promise<Machine[]>;
};

const thresholdLabels: Record<string, string> = {
  rpmMax: "RPM Max",
  torqueMax: "Torque Max",
  pressureMax: "Pressure Max",
  flowRateMax: "Flow Rate Max",
  oilLevelMax: "Oil Level Max",
  oilTemperatureMax: "Oil Temperature Max",
  motorCurrentMax: "Motor Current Max",
  fuelFlowMax: "Fuel Flow Max",
  exhaustTemperatureMax: "Exhaust Temperature Max",
  jointTorqueMax: "Joint Torque Max",
  currentMax: "Current Max",
  cycleCountMax: "Cycle Count Max",
};

function ThresholdViewDialog({
  machine,
  open,
  onClose,
}: {
  machine: Machine | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!machine) return null;

  const thresholds = machine.thresholds || {};

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Threshold Values - {machine.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Machine Info */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Machine Name</span>
                <p className="font-medium">{machine.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Model</span>
                <p className="font-medium">{machine.model_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Type</span>
                <p className="font-medium">
                  {machine.type.charAt(0) +
                    machine.type.slice(1).toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Status</span>
                <div>
                  <p
                    className={`inline-block mt-1 px-3 py-0.5 text-xs font-medium rounded-full ${
                      machine.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : machine.status === "IDLE"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {machine.status.charAt(0) +
                      machine.status.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Common Thresholds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Common Thresholds
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">
                    Temperature Max
                  </span>
                  <p className="font-semibold text-lg text-orange-600">
                    {machine.temperature_max}°C
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">
                    Vibration Max
                  </span>
                  <p className="font-semibold text-lg text-blue-600">
                    {machine.vibration_max} mm/s
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Power Max</span>
                  <p className="font-semibold text-lg text-purple-600">
                    {machine.power_max} kW
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Type-specific Thresholds */}
          {Object.keys(thresholds).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {machine.type.charAt(0) +
                  machine.type.slice(1).toLowerCase().replace("_", " ")}{" "}
                Specific Thresholds
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(thresholds).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {thresholdLabels[key] || key}
                      </span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EngineerMachineList({ machines }: Props) {
  const machineList = use(machines);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleViewThresholds(machine: Machine) {
    setSelectedMachine(machine);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setSelectedMachine(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">My Machines</h1>
      </div>
      <div
        id="scrollable"
        className="flex flex-col gap-4 flex-1 mt-3 overflow-auto thin-scrollbar"
      >
        <ThresholdViewDialog
          machine={selectedMachine}
          open={isDialogOpen}
          onClose={handleCloseDialog}
        />

        {machineList.length === 0 && (
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
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span>No machines assigned to you</span>
              </div>
              <p className="text-gray-500 text-sm">
                Contact your administrator to get machines assigned
              </p>
            </div>
          </div>
        )}

        {machineList.map((machine) => (
          <div
            key={machine.id}
            className="border shadow-md rounded-lg p-4 flex items-center gap-2"
          >
            <div className="flex flex-col grow">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{machine.name}</h2>
                <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-600 font-medium">
                  {machine.type.charAt(0) +
                    machine.type.slice(1).toLowerCase().replace("_", " ")}
                </span>

                <span
                  className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                    machine.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : machine.status === "IDLE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {machine.status.charAt(0) +
                    machine.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">{machine.model_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleViewThresholds(machine)}
              >
                <Eye className="mr-1 h-4 w-4" />
                View Thresholds
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
