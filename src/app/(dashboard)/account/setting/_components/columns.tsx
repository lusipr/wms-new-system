import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

interface ColumnDestinationMCProps {
  metaPage: { from: number };
  isLoading: boolean;
  setUserId: (value: string) => Promise<URLSearchParams>;
  setOpenDialog: (value: string) => Promise<URLSearchParams>;
  handleDelete: (id: any) => Promise<void>;
}

interface ActionButtonProps {
  tooltip: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: "yellow" | "sky" | "red";
  loading: boolean;
}

const ActionButton = ({
  tooltip,
  icon,
  onClick,
  color,
  loading,
}: ActionButtonProps) => {
  const colorMap = {
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
  };

  return (
    <TooltipProviderPage value={<p>{tooltip}</p>}>
      <Button
        className={`items-center w-9 px-0 flex-none h-9 ${colorMap[color]} disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed`}
        variant="outline"
        disabled={loading}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnDestinationMC = ({
  metaPage,
  isLoading,
  setUserId,
  setOpenDialog,
  handleDelete,
}: ColumnDestinationMCProps): ColumnDef<any>[] => [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role.role_name",
    header: "Role",
  },
  {
    accessorKey: "format_barcode_name",
    header: () => <div className="text-center">Format</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.format_barcode_name ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "total_scans",
    header: () => <div className="text-center">Total Scan</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.total_scans?.toLocaleString() ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ActionButton
          loading={isLoading}
          onClick={() => {
            setUserId(row.original.id);
            setOpenDialog("update");
          }}
          tooltip="Edit"
          icon={<Edit3 className="w-4 h-4" />}
          color="yellow"
        />
        <ActionButton
          loading={isLoading}
          onClick={() => handleDelete(row.original.id)}
          tooltip="Delete"
          icon={<Trash2 className="w-4 h-4" />}
          color="red"
        />
      </div>
    ),
  },
];
