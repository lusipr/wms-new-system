import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Boxes,
  Loader2,
  LucideIcon,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Printer,
  ReceiptText,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useState } from "react";

const ButtonAction = ({
  isLoading,
  label,
  onClick,
  type,
  icon: Icon,
}: {
  isLoading: boolean;
  label: string;
  onClick: (e: MouseEvent) => void;
  type: "red" | "yellow" | "sky";
  icon: LucideIcon;
}) => {
  const colorMap = {
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
  };

  return (
    <TooltipProviderPage value={label}>
      <Button
        className={cn(
          "items-center p-0 w-9 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
          colorMap[type],
        )}
        disabled={isLoading}
        variant={"outline"}
        type="button"
        onClick={onClick}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnProductStaging = ({
  metaPageProduct,
  isLoading,
  handleAddFilter,
  // handleDryScrap,
  // handleMigrateToRepair,
  // isPendingMigrateToRepair,
  setProductId,
  setIsOpen,
  // isPendingDryScrap,
  setIsOpenDamaged,
  setDamagedProductId,
  setDamagedBarcode,
  setSource,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPageProduct.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode ?? "-",
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">Product Name</div>,
    cell: ({ row }) => (
      <div className="max-w-75 break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "category_name",
    header: "Category",
    cell: ({ row }) => row.original.category_name ?? "-",
  },
  {
    accessorKey: "display_price",
    header: "Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.display_price)}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Input Date",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {format(new Date(row.original.created_at), "iii, dd MMM yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            "shadow-none font-normal rounded-full capitalize text-black",
            status === "display" && "bg-green-400/80 hover:bg-green-400/80",
            status === "expired" && "bg-red-400/80 hover:bg-red-400/80",
            status === "slow_moving" &&
              "bg-yellow-400/80 hover:bg-yellow-400/80",
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex justify-center">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-9 h-9 p-0",
                  open ? "text-blue-600 bg-blue-50" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleAddFilter(row.original.id);
                }}
                className="flex items-center gap-2 text-sky-700 focus:text-sky-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusCircle className="size-4" />
                )}
                Add to Filter
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen("detail");
                  setProductId(row.original.id);
                }}
                className="flex items-center gap-2 text-yellow-700 focus:text-yellow-700"
                disabled={isLoading}
              >
                <ReceiptText className="size-4" />
                Detail
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setDamagedProductId(row.original.id);
                  setDamagedBarcode(
                    row.original.new_barcode_product ??
                      row.original.old_barcode_product ??
                      "-",
                  );
                  setSource(row.original.source ?? "");
                  setIsOpenDamaged(true);
                }}
                className="flex items-center gap-2 text-red-700 focus:text-red-700"
                disabled={isLoading}
              >
                <Shield className="size-4" />
                Damaged
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export const columnFilteredProductStaging = ({
  metaPage,
  isLoading,
  handleRemoveFilter,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode ?? "-",
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-125 break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          label="Delete"
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFilter(row.original.id);
          }}
          isLoading={isLoading}
          icon={XCircle}
          type="red"
        />
      </div>
    ),
  },
];

export const columnRackStaging = ({
  metaPage,
  isLoading,
  setRackId,
  setInput,
  handleDelete,
  handleSubmit,
  setIsOpen,
  setSelectedBarcode,
  setSelectedNameRack,
  setSelectedTotalProduct,
  setBarcodeOpen,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode ?? "-",
  },
  {
    accessorKey: "name",
    header: "Name Rack",
    cell: ({ row }) => (
      <div className="max-w-75 break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "total_data",
    header: "Total Data",
    cell: ({ row }) => row.original.total_data ?? "-",
  },
  {
    accessorKey: "total_new_price_product",
    header: "New Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.total_new_price_product ?? 0)}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const [open, setOpen] = React.useState(false);

      return (
        <div className="flex justify-center">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-9 h-9 p-0",
                  open ? "text-blue-600 bg-blue-50" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="w-44">
              {/* Detail */}
              <DropdownMenuItem asChild>
                <Link
                  href={`/stagging/rack/details/${row.original.id}`}
                  className="flex items-center gap-2 text-sky-700 focus:text-sky-700"
                >
                  <ReceiptText className="size-4" />
                  Detail
                </Link>
              </DropdownMenuItem>

              {/* Edit Rack */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setRackId(row.original.id);
                  setInput((prev: any) => ({
                    ...prev,
                    displayId:
                      row.original.display_rack_id ??
                      row.original.display?.id ??
                      "",
                    display: {
                      id:
                        row.original.display_rack_id ??
                        row.original.display?.id ??
                        "",
                      name:
                        row.original.display?.name ?? row.original.name ?? "",
                    },
                    name: row.original.name ?? prev.name,
                  }));
                  setIsOpen("create-edit");
                }}
                className="flex items-center gap-2 text-yellow-700 focus:text-yellow-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                Edit Rack
              </DropdownMenuItem>

              {/* Print QR */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedBarcode(row.original.barcode);
                  setSelectedNameRack(row.original.name);
                  setSelectedTotalProduct(row.original.total_data);
                  setBarcodeOpen(true);
                }}
                className="flex items-center gap-2 text-sky-700 focus:text-sky-700"
              >
                <Printer className="size-4" />
                Print QR
              </DropdownMenuItem>

              {/* To Display */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(row.original.id);
                }}
                className="flex items-center gap-2 text-indigo-700 focus:text-indigo-700"
                disabled={isLoading}
              >
                <Boxes className="size-4" />
                To Display
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Delete */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(row.original.id);
                }}
                className="flex items-center gap-2 text-red-700 focus:text-red-700"
                disabled={isLoading}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
