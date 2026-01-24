"use client";

import {
  ChevronDown,
  Circle,
  Loader2,
  PencilRuler,
  Plus,
  PlusCircle,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmit } from "../_api/use-submit";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { useGetCreateRepair } from "../_api/use-get-create-repair";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProduct, setIsProduct] = useState(false);

  const [input, setInput] = useState({
    name: "",
    categoryId: 0,
    category: "",
    color: "",
    total: "0",
    custom: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    to: 1, //data sampai
    perPage: 1,
  });

  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const [pageProduct, setPageProduct] = useState(1);
  const [metaPageProduct, setMetaPageProduct] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    to: 1, //data sampai
    perPage: 1,
  });

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [SubmitDialog, confirmSubmit] = useConfirm(
    "Create Repair",
    "This action cannot be undone",
    "liquid",
  );

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Remove Product From Filter",
    "This action cannot be undone",
    "destructive",
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetCreateRepair({ p: page });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataList: any[] = useMemo(() => {
    return data?.data.resource.data;
  }, [data]);

  console.log("dataList:", dataList);

  const dataListCategories: any[] = useMemo(() => {
    return data?.data.resource.category ?? [];
  }, [data]);

  console.log("dataListCategories:", dataListCategories);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data?.data?.resource?.data;
  }, [dataProduct]);

  console.log("dataListProduct:", dataProduct);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    const dataResource = data?.data?.resource;
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: dataResource?.data,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      color: dataResource?.color ?? "",
      total: dataResource?.total_new_price ?? "0",
      custom: !dataResource?.category
        ? Math.round(dataResource?.fixed_price).toString()
        : Math.round(dataResource?.total_new_price).toString(),
      category: dataResource?.category ? prev.category : "",
    }));
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data?.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleAddProduct = (id: any) => {
    mutateAddProduct(
      { id },
      {
        onSuccess: () => {
          handleCloseProduct();
        },
      },
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleSubmit = async () => {
    const ok = await confirmSubmit();

    if (!ok) return;

    const body = {
      bundle_type: "repair",
      name_bundle: input.name,
    };

    mutateSubmit({ body });
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
    setPageProduct(1);
    setMetaPageProduct({
      from: 0,
      last: 0,
      perPage: 0,
      to: 0,
      total: 0,
    });
  };

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    if (isNaN(parseFloat(input.custom))) {
      setInput((prev) => ({ ...prev, custom: "0" }));
    }
  }, [input]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle error product
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  const columnRepair: ColumnDef<any>[] = [
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
      accessorKey: "new_barcode",
      header: "Barcode",
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-125 break-all">{row.original.product_name}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
            variant={"outline"}
            type="button"
            disabled={isPendingRemoveProduct || isPendingSubmit}
            onClick={() => {
              handleRemoveProduct(row.original.id);
            }}
          >
            {isPendingRemoveProduct ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            <div>Delete</div>
          </Button>
        </div>
      ),
    },
  ];

  const columnProduct: ColumnDef<any>[] = [
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
      accessorKey: "new_barcode??old_barcode",
      header: "Barcode",
      cell: ({ row }) => row.original.new_barcode ?? row.original.old_barcode,
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-125 break-all">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "category??new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.category ?? row.original.new_tag_product ?? "-",
    },
    {
      accessorKey: "old_price",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.old_price),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Add Product"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleAddProduct(row.original.id);
              }}
              type="button"
            >
              {isPendingAddProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
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
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <SubmitDialog />
      <DeleteProductDialog />
      <DialogProduct
        open={isProduct}
        onCloseModal={() => {
          if (isProduct) {
            handleCloseProduct();
          }
        }}
        search={productSearch}
        setSearch={setProductSearch}
        refetch={refetchProduct}
        isRefetching={isRefetchingProduct}
        columns={columnProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
      />
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Moving Product</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/moving-product/repair">
                Repair
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Create</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* CREATE BUNDLE */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center">
              <PencilRuler className="size-4 text-sky-600" />
            </div>
            <h2 className="text-lg font-semibold">Create Repair</h2>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repair Name */}
            <div className="space-y-1">
              <Label>Repair Name</Label>
              <Input
                placeholder="Repair Name..."
                value={input.name}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>{input.color ? "Tag Color" : "Category"}</Label>

              {!input.color && dataListCategories.length === 0 && (
                <Input disabled placeholder="Select Product First..." />
              )}

              {input.color && <Input disabled value={input.color} />}

              {!input.color && dataListCategories.length > 0 && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {input.category || "Not Selected"}
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="p-0 bg-white border border-gray-300 shadow-md"
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <Command className="bg-white">
                      <CommandInput className="bg-white" />
                      <CommandList className="p-1 bg-white">
                        <CommandGroup heading="List Categories">
                          <CommandEmpty>No Data Found.</CommandEmpty>
                          {dataListCategories.map((item) => (
                            <CommandItem
                              key={item.id}
                              className="border border-gray-500 my-2 first:mt-0 last:mb-0 flex gap-2 items-center"
                              onSelect={() => {
                                setInput((prev) => ({
                                  ...prev,
                                  categoryId: item.id, 
                                  category: item.name_category,
                                  custom: (
                                    parseFloat(prev.total) -
                                    (parseFloat(prev.total) / 100) *
                                      item.discount_category
                                  ).toString(),
                                }));
                                setIsOpen(false);
                              }}
                            >
                              <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                {input.category === item.name_category && (
                                  <Circle className="fill-black size-2.5" />
                                )}
                              </div>
                              <div className="w-full flex flex-col gap-1">
                                <div className="w-full font-medium">
                                  {item.name_category}
                                </div>
                                <Separator className="bg-gray-500" />
                                <p className="text-xs text-start w-full text-gray-500">
                                  {item.discount_category +
                                    "% - Max. " +
                                    (formatRupiah(
                                      Math.round(item.max_price_category),
                                    ) ?? "Rp 0")}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Total Price */}
            <div className="space-y-1">
              <Label>Total Price</Label>
              <Input disabled value={formatRupiah(parseFloat(input.total))} />
            </div>

            {/* Custom Price */}
            <div className="space-y-1">
              <Label>Custom Price</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={input.custom}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      custom: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {formatRupiah(parseFloat(input.custom))}
                </span>
              </div>
            </div>
          </div>

          {/* Button */}
          <Button
            className="w-full bg-sky-500 hover:bg-sky-600"
            onClick={handleSubmit}
            disabled={!input.name || dataList.length === 0}
          >
            <Send className="size-4 mr-2" />
            Create
          </Button>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <div className="flex w-full justify-between gap-4 items-center">
            <h5 className="pr-5 border-b border-gray-500 text-lg h-fit font-bold">
              List Product Filtered
            </h5>
            <div className="flex gap-4 items-center">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                  disabled={isPendingSubmit || isRefetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"liquid"}
                disabled={isPendingSubmit || isPendingAddProduct}
                onClick={() => setIsProduct(true)}
              >
                <Plus className="size-4 mr-1" />
                Add Product
              </Button>
            </div>
          </div>
          <DataTable
            isLoading={isRefetching}
            columns={columnRepair}
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
