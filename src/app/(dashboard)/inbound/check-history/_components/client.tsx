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
import { ReceiptText, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, setPaginate } from "@/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";
import { useGetCheckHistory } from "../_api/use-get-check-history";
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

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
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
    to: 1, //data sampai
    total: 1, //total data
    perPage: 1,
  });

  const { mutate } = useDeleteHistory();
  const {
    data,
    isError,
    error,
    refetch,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetCheckHistory({
    p: page,
    q: searchValue,
  });

  const loading = isPending || isRefetching || isLoading;

  const dataCH: any[] = useMemo(() => {
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

    mutate({ id });
  };

  const columnCheckHistory: ColumnDef<any>[] = [
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
      accessorKey: "base_document",
      header: "Data Name",
      cell: ({ row }) => (
        <div className="break-all max-w-125">{row.original.base_document}</div>
      ),
    },
    {
      accessorKey: "CreatedAt",
      header: "Date",
      cell: ({ row }) => {
        const formated = format(
          new Date(row.original.CreatedAt),
          "iiii, dd MMMM yyyy"
        );
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "TotalData",
      header: () => <div className="text-center">Total Items</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {row.original.TotalData.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "TotalDataIn",
      header: () => <div className="text-center">Total In</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {row.original.TotalDataIn.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status_approve",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_approve.toLowerCase() === "done"
                ? "bg-green-400 hover:bg-green-400"
                : "bg-yellow-400 hover:bg-yellow-400"
            )}
          >
            {row.original.status_approve}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value="Detail">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["detail-check-history", row.original.id],
                });
                queryClient.invalidateQueries({
                  queryKey: [
                    "product-detail-check-history",
                    row.original.code_document,
                  ],
                });
              }}
            >
              <Link href={`/inbound/check-history/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Delete">
            <Button
              className="items-center px-0  border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 w-9"
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
    <div className="flex flex-col items-start bg-gray-100 w-full px-4 gap-4 py-4">
      <DeleteDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check History</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Check History</h2>
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
          <DataTable columns={columnCheckHistory} data={dataCH ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
