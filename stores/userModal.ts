import { Role } from "@prisma/client";
import {create} from "zustand";

type State={
    isUserModalOpen: boolean;
    type: "add" | "edit";
    data:{
        id:string;
        name:string;
        email:string;
        role: Extract<Role, "ENGINEER" | "MAINTENANCE">;
    };
}

type Actions={
    openAddModal: ()=>void;
    openEditModal: (data:{id:string;name:string;email:string;role:Extract<Role, "ENGINEER" | "MAINTENANCE">})=>void;
    closeModal: ()=>void;
    setData: (data:{id:string;name:string;email:string;role:Extract<Role, "ENGINEER" | "MAINTENANCE">})=>void;
    reset: ()=>void;    
}

export const useUserModalStore = create<State & Actions>((set)=>({
    isUserModalOpen: false,
    type: "add",
    data: {
        id: "",
        name: "",
        email: "",
        role: "ENGINEER",
    },
    openAddModal: ()=>set({isUserModalOpen: true, type: "add"}),
    openEditModal: (data)=>set({isUserModalOpen: true, type: "edit",data}),
    closeModal: ()=>set({isUserModalOpen: false}),
    setData: (data)=>set({data}),
    reset: ()=>set({
        isUserModalOpen: false,
        type: "add",
        data: {
            id: "",
            name: "",
            email: "",
            role: "ENGINEER",
        },
    }),  
}));