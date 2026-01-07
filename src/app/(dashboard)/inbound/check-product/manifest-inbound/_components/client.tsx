"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Loader2,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, promiseToast, setPaginate } from "@/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";
import { useGetManifestInbound } from "../_api/use-get-manifest-inbound";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteHistory } from "../_api/use-delete-history";
import Pagination from "@/components/pagination";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/(dashboard)/loading";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Client = () => {
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const queryClient = useQueryClient();
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Data",
    "This action cannot be undone",
    "destructive"
  );
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const { mutate, isPending: isPendingDelete } = useDeleteHistory();
  const {
    data,
    isError,
    error,
    refetch,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetManifestInbound({
    p: page,
    q: searchValue,
  });

  const loading = isPending || isRefetching || isLoading;

  const dataMI: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    const promise = new Promise((resolve, reject) => {
      mutate(
        { id },
        {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        }
      );
    });

    promiseToast({
      promise,
      loading: "Deleting...",
      success: "Manifest Inbound Successfully Deleted",
      error: "Manifest Inbound failed to delete",
    });
  };

  const columnManifestInbound: ColumnDef<any>[] = [
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
      accessorKey: "name_document",
      header: "Document Name",
      cell: ({ row }) => (
        <div className="break-all max-w-125">{row.original.name_document}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const formated = format(
          new Date(row.original.created_at),
          "iiii, dd MMMM yyyy"
        );
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "total_column_document",
      header: () => <div className="text-center">Total Items</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {row.original.total_column_document.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status_document",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded-xl w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_document === "pending" &&
                "yellow hover:yellow",
              row.original.status_document === "in progress" &&
                "blue hover:blue",
              row.original.status_document === "done" && "green hover:green"
            )}
          >
            {row.original.status_document}
          </Badge>
        </div>
      ),
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
                    open ? "text-blue-600 bg-blue-50" : "text-muted-foreground"
                  )}
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-40">
                {/* CHECK */}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/inbound/check-product/manifest-inbound/${row.original.code_document}/check`}
                    onClick={() => {
                      queryClient.invalidateQueries({
                        queryKey: [
                          "check-manifest-inbound",
                          row.original.code_document,
                        ],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["check-categories-manifest-inbound"],
                      });
                    }}
                    className="flex items-center gap-2 text-green-700"
                  >
                    <ShieldCheck className="size-4" />
                    Check
                  </Link>
                </DropdownMenuItem>

                {/* DETAIL */}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/inbound/check-product/manifest-inbound/${row.original.code_document}/detail`}
                    onClick={() => {
                      queryClient.invalidateQueries({
                        queryKey: [
                          "detail-manifest-inbound",
                          row.original.code_document,
                        ],
                      });
                    }}
                    className="flex items-center gap-2 text-sky-700"
                  >
                    <ReceiptText className="size-4" />
                    Detail
                  </Link>
                </DropdownMenuItem>

                {/* DELETE */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(row.original.code_document);
                  }}
                  className="flex items-center gap-2 text-red-700 focus:text-red-700"
                  disabled={isPendingDelete}
                >
                  {isPendingDelete ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Manifest Inbound</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List of Document Data</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={dataSearch}
              onChange={(e) => setDataSearch(e.target.value)}
              placeholder="Search..."
            />
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable columns={columnManifestInbound} data={dataMI ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
