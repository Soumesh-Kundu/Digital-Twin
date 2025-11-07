import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";
type Props = {
  children: React.ReactNode;
  message?: string;
  onYes: () => Promise<void>;
};

export default function ConfirmationBox({ children, message, onYes }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  async function handleYes() {
    if (isLoading) return;
    setIsLoading(true);
    await onYes();
    setIsLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle hidden></DialogTitle>
        <p className="text-gray-500 text-center">{message}</p>
        <div className="flex items-center gap-2 justify-center mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-24">No</Button>
          </DialogClose>
          <Button variant="destructive" className="w-24" onClick={handleYes}>
            {
                isLoading? <Ring color="white" size={20} stroke={1.5} /> : "Yes"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
