"use client";

import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Loader, Loader2, PlusCircle } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsString, useQueryState } from "nuqs";

import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";

import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";

import { useGetListAccount, useDeleteAccount, useGetListRole } from "../_api";

import DialogCreateEdit from "./dialog/dialog-create-edit";

import { alertError } from "@/lib/utils";
import { useSearchQuery } from "@/lib/search";
import { columnDestinationMC } from "./columns";
import { useConfirm } from "@/hooks/use-confirm";
import { usePagination } from "@/lib/pagination";
import { InputSearch } from "@/components/input-search";

export const Client = () => {
  // dialog create edit
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );

  // user Id for Edit
  const [userId, setUserId] = useQueryState(
    "userId",
    parseAsString.withDefault("")
  );

  // loading
  const [isMounted, setIsMounted] = useState(false);

  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, setPage, setPagination } = usePagination();

  // donfirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete User",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteAccount();

  // get data utama
  const {
    data,
    error,
    isError,
    refetch,
    isLoading,
    isPending,
    isSuccess,
    isRefetching,
  } = useGetListAccount({ p: page, q: searchValue });

  const {
    data: dataRole,
    isLoading: isLoadingRole,
    error: errorRole,
    isError: isErrorRole,
  } = useGetListRole();

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListRole: any[] = useMemo(() => {
    return dataRole?.data.data.resource;
  }, [dataRole]);

  // load data
  const loading = isLoading || isRefetching || isPending || isPendingDelete;

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ params: { id } });
  };

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Data",
      method: "GET",
    });
    // isError get Role
    alertError({
      isError: isErrorRole,
      error: errorRole as AxiosError,
      action: "get data",
      data: "Role",
      method: "GET",
    });
  }, [isError, error, isErrorRole, errorRole]);

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
      <DialogCreateEdit
        open={openDialog === "create" || openDialog === "update"} // open modal
        onCloseModal={() => {
          if (openDialog) {
            setOpenDialog(null);
            setUserId("");
          }
        }} // handle close modal
        role={dataListRole ?? []}
        userId={userId} // userId
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Account</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Setting</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
        <h2 className="text-xl font-bold">Role Account</h2>
        <ul className="w-full p-4 rounded-md border border-sky-400/80 grid grid-cols-4 gap-2">
          {isLoadingRole ? (
            <li className="col-span-4 h-20 flex items-center justify-center">
              <Loader className="size-5 animate-spin" />
            </li>
          ) : (
            dataListRole?.map((item, i) => (
              <li key={item.id}>{i + 1 + " - " + item.role_name}</li>
            ))
          )}
        </ul>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Accounts</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <InputSearch
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
              onClick={() => refetch()}
              loading={loading}
            />
            <div className="flex gap-4 items-center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDialog("create");
                }}
                disabled={loading}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <PlusCircle className={"w-4 h-4 mr-1"} />
                )}
                Add Account
              </Button>
            </div>
          </div>
          <DataTable
            columns={columnDestinationMC({
              metaPage,
              isLoading: loading,
              handleDelete,
              setOpenDialog,
              setUserId,
            })}
            data={dataList ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
