"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowRightCircle,
  FileDown,
  PlusCircle,
  RefreshCw,
  Server,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryState } from "nuqs";
import { DataTable } from "@/components/data-table";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListRacks } from "../_api/use-get-list-racks";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { Input } from "@/components/ui/input";
import { useCreateRack } from "../_api/use-create-rack";
import { useUpdateRack } from "../_api/use-update-rack";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteRack } from "../_api/use-delete-rack";
import { useGetListProduct } from "../_api/use-get-list-product";
import Pagination from "@/components/pagination";
import { columnProductStaging, columnRackStaging } from "./columns";
import { useAddFilterProductStaging } from "../_api/use-add-filter-product-staging";
import { useExportStagingProduct } from "../_api/use-export-staging-product";
import { DialogDetail } from "./dialog-detail";
import { DialogToLPR } from "./dialog-to-lpr";
import { DialogFiltered } from "./dialog-filtered";
import { useGetListCategories } from "../_api/use-get-list-categories";
import { useSubmit } from "../_api/use-submit";
import { useDryScrap } from "../_api/use-dry-scrap";
import DialogBarcode from "./dialog-barcode";
import { useMigrateToRepair } from "../_api/use-migrate-to-repair";
import { useToDamaged } from "../_api/use-to-damaged";
import { DialogDamaged } from "./dialog-damaged";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

type ViewMode = "rack" | "product";

export const Client = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("rack");

  const [isOpen, setIsOpen] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );
  const [productId, setProductId] = useQueryState(
    "id",
    parseAsString.withDefault(""),
  );
  // rack Id for Edit
  const [rackId, setRackId] = useQueryState("rackId", {
    defaultValue: "",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedNameRack, setSelectedNameRack] = useState("");
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [selectedTotalProduct, setSelectedTotalProduct] = useState("");
  const [isOpenDamaged, setIsOpenDamaged] = useState(false);
  const [damagedDescription, setDamagedDescription] = useState("");
  const [damagedProductId, setDamagedProductId] = useState("");
  const [source, setSource] = useState("");
  const [damagedBarcode, setDamagedBarcode] = useState("");

  // separate search states for rack and product so values don't collide
  const {
    search: searchRack,
    searchValue: searchValueRack,
    setSearch: setSearchRack,
  } = useSearchQuery("qRack");

  const {
    search: searchProduct,
    searchValue: searchValueProduct,
    setSearch: setSearchProduct,
  } = useSearchQuery("qProduct");

  const { searchValue: searchValueCategories } = useSearchQuery("qCategories");

  // local input state stored at parent level so values survive tab unmounts
  const [searchRackInput, setSearchRackInput] = useState<string>(
    (searchRack as string) ?? "",
  );
  const [searchProductInput, setSearchProductInput] = useState<string>(
    (searchProduct as string) ?? "",
  );

  // keep local input in sync when query state changes externally
  useEffect(() => {
    setSearchRackInput((searchRack as string) ?? "");
  }, [searchRack]);

  useEffect(() => {
    setSearchProductInput((searchProduct as string) ?? "");
  }, [searchProduct]);

  const { metaPage, page, setPage, setPagination } = usePagination("p");

  const {
    metaPage: metaPageProduct,
    page: pageProduct,
    setPage: setPageProduct,
    setPagination: setPaginationProduct,
  } = usePagination("pProduct");

  // data form create edit
  type InputState = {
    displayId: string;
    source: string;
    name: string;
    display: { id: string; name: string };
  };

  const [input, setInput] = useState<InputState>({
    displayId: "",
    source: "staging",
    name: "",
    display: { id: "", name: "" },
  });

  // confirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Rack Stagging",
    "This action cannot be undone",
    "destructive",
  );

  const [ToDisplayDialog, confirmToDisplay] = useConfirm(
    "To Display Rack",
    "This action cannot be undone",
    "destructive",
  );

  const [DialogDryScrap, confirmDryScrap] = useConfirm(
    "Dry Scrap Product Stagging",
    "This action cannot be undone",
    "destructive",
  );

  const [DialogMigrateToRepair, confirmMigrateToRepair] = useConfirm(
    "Migrate Product Stagging to Repair",
    "This action cannot be undone",
    "destructive",
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteRack();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateRack();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateRack();
  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductStaging();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportStagingProduct();
  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();
  const { mutate: mutateDryScrap, isPending: isPendingDryScrap } =
    useDryScrap();
  const { mutate: mutateMigrateToRepair, isPending: isPendingMigrateToRepair } =
    useMigrateToRepair();
  const { mutate: mutateDamaged, isPending: isPendingDamaged } = useToDamaged();

  const {
    data: dataRacks,
    refetch: refetchRacks,
    isLoading: isLoadingRacks,
    isError: isErrorRacks,
    error: errorRacks,
  } = useGetListRacks({ p: page, q: searchValueRack });

  const {
    data: dataProducts,
    refetch: refetchProducts,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useGetListProduct({
    p: pageProduct,
    q: searchValueProduct,
  });

  const { data: dataCategories } = useGetListCategories({
    p: page,
    q: searchValueCategories,
  });

  const rackData = dataRacks?.data.data.resource;
  const racksData = rackData?.data;
  console.log("rackDataaaaa:", racksData);
  const totalRacks = rackData?.total_racks ?? 0;
  const totalProductRack = rackData?.total_products_in_racks ?? 0;

  console.log("productData:", dataProducts);
  const productData = dataProducts?.data.data.resource.data;
  const CategoriesData = useMemo(() => {
    return dataCategories?.data.data.resource;
  }, [dataCategories]);
  const loading =
    isLoadingProducts ||
    isPendingAddFilter ||
    isPendingExport ||
    isPendingSubmit ||
    isPendingDryScrap ||
    isPendingMigrateToRepair ||
    isLoadingRacks ||
    isPendingDelete ||
    isPendingCreate ||
    isPendingUpdate;

  // handle close
  const handleClose = () => {
    setIsOpen("");
    setRackId(null);
    setInput((prev) => ({
      ...prev,
      displayId: "",
      display: { id: "", name: "" },
    }));
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

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      display_rack_id: input.displayId ? Number(input.displayId) : null,
      source: input.source ?? "staging",
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      display_rack_id: input.displayId ? Number(input.displayId) : null,
      name: input.display.name,
    };
    mutateUpdate(
      { id: rackId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // handle to damaged
  const handleSubmitDamaged = () => {
    mutateDamaged(
      {
        body: {
          description: damagedDescription,
          product_id: damagedProductId,
          source: source,
        },
      },
      {
        onSuccess: () => {
          setIsOpenDamaged(false);
          setDamagedDescription("");
          setDamagedProductId("");
          setSource("");
        },
      },
    );
  };

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  const handleSubmit = async (id: any) => {
    const ok = await confirmToDisplay();

    if (!ok) return;
    mutateSubmit({ id });
  };

  const handleDryScrap = async (id: any) => {
    const ok = await confirmDryScrap();

    if (!ok) return;
    mutateDryScrap({ id });
  };

  const handleMigrateToRepair = async (id: any) => {
    const ok = await confirmMigrateToRepair();

    if (!ok) return;
    mutateMigrateToRepair({ id });
  };
  useEffect(() => {
    if (dataRacks) setPagination(dataRacks.data.data.resource);
  }, [dataRacks]);

  useEffect(() => {
    if (dataProducts) setPaginationProduct(dataProducts.data.data.resource);
  }, [dataProducts]);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <Loading />;

  if (
    (isErrorRacks && (errorRacks as AxiosError).status === 403) ||
    (isErrorProducts && (errorProducts as AxiosError).status === 403)
  ) {
    return <Forbidden />;
  }

  return (
    <div className="flex flex-col bg-gray-100 w-full px-4 py-4 gap-4">
      <DeleteDialog />
      <ToDisplayDialog />
      <DialogDetail
        open={isOpen === "detail"}
        onOpenChange={() => {
          if (isOpen === "detail") {
            setIsOpen("");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogFiltered
        open={isOpen === "filtered"}
        onOpenChange={() => {
          if (isOpen === "filtered") {
            setIsOpen("");
          }
        }}
      />
      <DialogDamaged
        isOpen={isOpenDamaged}
        handleClose={() => setIsOpenDamaged(false)}
        barcode={damagedBarcode}
        description={damagedDescription}
        setDescription={setDamagedDescription}
        isLoading={isPendingDamaged}
        handleSubmit={handleSubmitDamaged}
      />
      <DialogCreateEdit
        open={isOpen === "create-edit"}
        onOpenChange={() => {
          if (isOpen === "create-edit") {
            setIsOpen("");
            setRackId("");
          }
        }}
        rackId={rackId} // rackId
        input={input} // input form
        setInput={setInput} // setInput Form
        categories={CategoriesData?.data ?? CategoriesData}
        // categories={uniqueCategoryList} // unique categories
        handleCreate={handleCreate} // handle create rack
        handleUpdate={handleUpdate} // handle update rack
        isPendingCreate={isPendingCreate} // loading create
        isPendingUpdate={isPendingUpdate} // loading update
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stagging</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Rack</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold">Rak Stagging</h2>

          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
            <SelectTrigger
              className={`
        w-45
        text-white
        border
        transition-colors
        ${
          viewMode === "rack"
            ? "bg-[#16C8C7] border-[#16C8C7] hover:bg-[#14b4b3] focus:bg-[#16C8C7] data-[state=open]:bg-[#16C8C7]"
            : "bg-[#962DFF] border-[#962DFF] hover:bg-[#7f25d6] focus:bg-[#962DFF] data-[state=open]:bg-[#962DFF]"
        }
      `}
            >
              <SelectValue>
                {viewMode === "rack" ? "List Rak" : "List Product"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent
              className="
        bg-white!
        opacity-100!
        backdrop-blur-0
        border
        border-gray-200
        shadow-lg
      "
            >
              <SelectItem value="rack">List Rak</SelectItem>
              <SelectItem value="product">List Product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <hr className="border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4 mb-6">
          {/* Card: Total Rack */}
          <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-[#0B91FF] text-white">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm text-gray-500">Total Rack</h4>
            </div>

            <p className="text-3xl font-bold mt-3">{totalRacks}</p>
          </div>

          {/* Card: Total Product */}
          <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-[#0B91FF] text-white">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm text-gray-500">Total Product Rack</h4>
            </div>

            <p className="text-3xl font-bold mt-3">{totalProductRack}</p>
          </div>
        </div>
      </div>
      {/* CARD DROPDOWN */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {viewMode === "rack" ? "List Rak" : "List Product"}
          </h2>
        </div>
        <hr className="border-gray-200" />

        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {viewMode === "rack" ? (
              <Input
                className="w-65"
                value={searchRackInput}
                onChange={(e) => {
                  setSearchRackInput(e.target.value);
                  setSearchRack(e.target.value);
                }}
                placeholder="Search Rack..."
              />
            ) : (
              <Input
                className="w-65"
                value={searchProductInput}
                onChange={(e) => {
                  setSearchProductInput(e.target.value);
                  setSearchProduct(e.target.value);
                }}
                placeholder="Search Product..."
              />
            )}

            <Button
              onClick={() =>
                viewMode === "rack" ? refetchRacks() : refetchProducts()
              }
              variant="outline"
              className="w-9 h-9 px-0"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  (viewMode === "rack" ? isLoadingRacks : isLoadingProducts) &&
                    "animate-spin",
                )}
              />
            </Button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {viewMode === "rack" && (
              <Button
                onClick={() => setIsOpen("create-edit")}
                className="bg-[#0B91FF] text-white hover:bg-blue-500 focus:bg-[#0B91FF]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Rack
              </Button>
            )}

            {viewMode === "product" && (
              <>
                <Button
                  // onClick={handleExport}
                  variant="outline"
                  disabled={isPendingExport}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button
                  onClick={() => setIsOpen("filtered")}
                  className="bg-[#0B91FF] text-white"
                >
                  Filter
                  <ArrowRightCircle className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {viewMode === "rack" ? (
          <>
            <DataTable
              columns={columnRackStaging({
                metaPage,
                isLoadingRacks,
                handleDelete: (id: any) =>
                  confirmDelete().then((ok) => ok && mutateDelete({ id })),
                // handleSubmit: mutateSubmit,
                handleSubmit,
                handleUpdate,
                setRackId,
                setInput,
                setIsOpen,
                setSelectedBarcode,
                setSelectedNameRack,
                setSelectedTotalProduct,
                setBarcodeOpen,
              })}
              data={racksData ?? []}
              isLoading={isLoadingRacks}
            />

            <Pagination
              pagination={{ ...metaPage, current: page }}
              setPagination={setPage}
            />
          </>
        ) : (
          <>
            <DataTable
              columns={columnProductStaging({
                metaPageProduct,
                isLoadingProducts,
                isPendingDryScrap,
                handleAddFilter,
                handleDryScrap,
                handleMigrateToRepair,
                isPendingMigrateToRepair,
                setProductId,
                setIsOpen,
                setDamagedProductId,
                setDamagedBarcode,
                setIsOpenDamaged,
                setSource,
              })}
              data={productData ?? []}
              isLoading={isLoadingProducts}
            />

            <Pagination
              pagination={{ ...metaPageProduct, current: pageProduct }}
              setPagination={setPageProduct}
            />
          </>
        )}
      </div>
    </div>
  );
};
