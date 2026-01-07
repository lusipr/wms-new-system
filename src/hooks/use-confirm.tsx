"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { JSX, useState } from "react";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "default"
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto  hide-scrollbar max-w-[85vh]">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full h-full border-none shadow-none">
          <CardContent className="pt-8">
            <CardHeader className="p-0">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="whitespace-pre-line">{message}</CardDescription>
            </CardHeader>
            <div className="w-full pt-4 flex items-center flex-col gap-y-2 lg:flex-row gap-x-2 justify-end">
              <Button
                className="w-full lg:w-auto"
                variant={"outline"}
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="w-full lg:w-auto"
                variant={variant}
                onClick={handleConfirm}
                type="button"
              >
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
