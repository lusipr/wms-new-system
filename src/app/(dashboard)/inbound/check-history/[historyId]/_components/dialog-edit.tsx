"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatRupiah } from "@/lib/utils";
import React from "react";

const DialogEdit = ({
  open,
  onCloseModal,
  productId,
  input,
  setInput,
  handleClose,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  productId: any;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleUpdate: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{"Edit Product"}</DialogTitle>
        </DialogHeader>
        <div className="flex w-full gap-4">
          <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Actual Price</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Rp 0"
                  value={input.actual_old_price_product}
                  type="number"
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      actual_old_price_product: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {formatRupiah(parseFloat(input.actual_old_price_product)) ??
                    "Rp 0"}
                </p>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Condition</Label>
                <select
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  value={input.condition}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      condition: e.target.value,
                    }))
                  }
                >
                  <option disabled value="">
                    Select Condition...
                  </option>
                  <option value="lolos">Lolos</option>
                  <option value="abnormal">Abnormal</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Description</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Description..."
                  value={input.deskripsi}
                  required
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      deskripsi: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  productId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
              >
                {"Update"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEdit;
