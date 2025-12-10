"use client";

import { ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MACHINE_TYPE } from "@prisma/client";

type Assignment = {
  id: string;
  assignedAt: Date;
  machine: {
    id: string;
    name: string;
    type: MACHINE_TYPE;
  };
  user: {
    id: string;
    name: string;
  };
};

type Props = {
  assignments: Assignment[];
};

const machineTypeColors: Record<MACHINE_TYPE, string> = {
  CNC: "bg-blue-100 text-blue-700",
  HYDRAULIC: "bg-purple-100 text-purple-700",
  FURNACE: "bg-orange-100 text-orange-700",
  ROBOTIC_ARM: "bg-cyan-100 text-cyan-700",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatMachineType(type: MACHINE_TYPE) {
  return type.replace("_", " ").charAt(0) + type.replace("_", " ").slice(1).toLowerCase();
}

export default function RecentAssignmentsCard({ assignments }: Props) {
  // Get the most recent 5 assignments
  const recentAssignments = assignments
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 5);

  return (
    <div className="col-span-4 bg-white rounded-xl shadow-md border p-6 h-80 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Recent Assignments</h3>
      </div>

      <div className="flex-1 rounded-lg border overflow-hidden overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Machine</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Assigned At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.user.name}</TableCell>
                  <TableCell>{assignment.machine.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        machineTypeColors[assignment.machine.type]
                      }`}
                    >
                      {formatMachineType(assignment.machine.type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate(assignment.assignedAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No assignments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
