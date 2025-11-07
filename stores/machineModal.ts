import { MACHINE_TYPE, MachinesStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { create } from "zustand";

type State = {
    isMachineModalOpen: boolean;
    type: "add" | "edit";
    data: {
        id: string;
        name: string;
        model_name: string;
        type: MACHINE_TYPE;
        power_max?: number;
        status: MachinesStatus;
        temperature_max: number;
        vibration_max: number;
        thresholds: JsonValue;
    }
}
type Actions = {
    openAddModal: () => void;
    openEditModal: (data: State["data"]) => void;
    closeModal: () => void;
    reset: () => void;
}
export const useMachineModalStore = create<State & Actions>((set) => ({
    isMachineModalOpen: false,
    type: "add",
    data: {
        id: "",
        name: "",
        model_name: "",
        type: MACHINE_TYPE.CNC,
        power_max: undefined,
        status: MachinesStatus.ACTIVE,
        temperature_max: 0,
        vibration_max: 0,
        thresholds: {},
    },
    openAddModal: () => set(() => ({
        isMachineModalOpen: true,
        type: "add",
    })),
    openEditModal: (data) => set(() => ({
        isMachineModalOpen: true,
        type: "edit",
        data,
    })),
    closeModal: () => set(() => ({
        isMachineModalOpen: false,
    })),
    reset: () => set(() => ({
        isMachineModalOpen: false,
        type: "add",
        data: {
            id: "",
            name: "",
            model_name: "",
            type: MACHINE_TYPE.CNC,
            power_max: undefined,
            status: MachinesStatus.ACTIVE,
            temperature_max: 0,
            vibration_max: 0,
            thresholds: {}
        }
    }))
}))
