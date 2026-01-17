"use client";

import {
  Edit3,
  FileDown,
  Loader2,
  Percent,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListCategories } from "../_api/use-get-list-categories";
import { useDeleteProductCategory } from "../_api/use-delete-product-category";
import { useExportCategories } from "../_api/use-export-categories";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateCategory } from "../_api/use-update-category";
import { useGetDetailCategory } from "../_api/use-get-detail-category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateCategory } from "../_api/use-create-category";

export const Client = () => {
  const queryClient = useQueryClient();

  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [categoryId, setCategoryId] = useQueryState("categoryId", {
    defaultValue: "",
  });
  const [input, setInput] = useState({
    name: "",
    discount: "0",
    maxPrice: "0",
  });

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Category",
    "This action cannot be undone",
    "liquid"
  );

  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteProductCategory();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportCategories();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateCategory();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateCategory();

  const { data, refetch, isLoading, isRefetching, isPending, error, isError } =
    useGetListCategories({ q: searchValue });
  const {
    data: dataCategory,
    isLoading: isLoadingCategory,
    isSuccess: isSuccessCategory,
    isError: isErrorCategory,
    error: errorCategory,
  } = useGetDetailCategory({ id: categoryId });

  const dataList: any[] = useMemo(() => {
    return data?.data.resource;
  }, [data]);

  const loading = isLoading || isRefetching || isPending;

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorCategory,
      error: errorCategory as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorCategory, errorCategory]);

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleClose = () => {
    setOpenCreateEdit(false);
    setCategoryId("");
    setInput({
      name: "",
      discount: "0",
      maxPrice: "0",
    });
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_category: input.name,
      discount_category: input.discount,
      max_price_category: input.maxPrice,
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: ["list-categories"],
          });
        },
      }
    );
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_category: input.name,
      discount_category: input.discount,
      max_price_category: input.maxPrice,
    };
    mutateUpdate(
      { id: categoryId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: ["category-detail", data.data.data.resource.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["list-categories"],
          });
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccessCategory && dataCategory) {
      return setInput({
        name: dataCategory.data.data.resource.name_category ?? "",
        discount:
          Math.round(
            dataCategory.data.data.resource.discount_category
          ).toString() ?? "0",
        maxPrice:
          Math.round(
            dataCategory.data.data.resource.max_price_category
          ).toString() ?? "0",
      });
    }
  }, [dataCategory]);

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
    }
    if (isNaN(parseFloat(input.maxPrice))) {
      setInput((prev) => ({ ...prev, maxPrice: "0" }));
    }
  }, [input]);

  const columnApprovementStaging: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_name_product",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="max-w-100 break-all">
          {row.original.name_category}
        </div>
      ),
    },
    {
      accessorKey: "discount_category",
      header: () => <div className="text-center">Discount</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.discount_category}%
        </div>
      ),
    },
    {
      accessorKey: "max_price_category",
      header: "Max. Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.max_price_category)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isLoadingCategory || isPendingUpdate || isPendingCreate}
              onClick={(e) => {
                e.preventDefault();
                setCategoryId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingCategory || isPendingUpdate || isPendingCreate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
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
          <BreadcrumbItem>Setting Sub Category</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Sub Categories</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
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
              <div className="flex gap-4 items-center ml-auto">
                <TooltipProviderPage value={"Export Data"} side="left">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport();
                    }}
                    className="items-center flex-none h-9 px-0 w-9 bg-sky-100 border border-sky-400 hover:bg-sky-200 text-black disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    disabled={isPendingExport}
                    variant={"outline"}
                  >
                    {isPendingExport ? (
                      <Loader2 className={"w-4 h-4 animate-spin"} />
                    ) : (
                      <FileDown className={"w-4 h-4"} />
                    )}
                  </Button>
                </TooltipProviderPage>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenCreateEdit(true);
                  }}
                  disabled={
                    isLoadingCategory || isPendingUpdate || isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingCategory || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Category
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnApprovementStaging} data={dataList ?? []} />
        </div>
      </div>
      <Dialog
        open={openCreateEdit}
        onOpenChange={() => {
          handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryId ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={!categoryId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Category Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Category name..."
                  value={input.name}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Discount</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.discount}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      discount: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <Percent className="size-4 absolute right-3 bottom-2" />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Max Price</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Rp 0"
                  value={input.maxPrice}
                  type="number"
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      maxPrice: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {formatRupiah(parseFloat(input.maxPrice)) ?? "Rp 0"}
                </p>
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
                  categoryId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  !input.name ||
                  parseFloat(input.maxPrice) <= 0 ||
                  parseFloat(input.discount) < 0
                }
              >
                {categoryId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
