"use client";

import {
  CalendarIcon,
  ChevronDown,
  FileDown,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
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
import { useGetListSummaryInbound } from "../_api/use-get-list-summary-inbound";
import { format, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useExportSelectedData } from "../_api/use-export-summary-inbound";
import { useExportSelectedDataday } from "../_api/use-export-summary-inbound-day";
export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportSelectedData();
  const { mutate: mutateExportDay, isPending: isPendingExportDay } =
    useExportSelectedDataday();
  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListSummaryInbound({
    p: page,
    q: searchValue,
    date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
    date_to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  });

  const dataInbound = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data?.data?.resource?.data;
  }, [data]);

  const loading = isPending || isRefetching || isLoading;

  const clearRange = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDate({ from: undefined, to: undefined });
  };

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setMetaPage: setMetaPage,
      setPage: setPage,
    });
  }, [data]);

  // isError get data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // column data
  const columnDestinationMC: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Qty",
    },
    {
      accessorKey: "old_price_product",
      header: "Old Price",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {formatRupiah(row.original.old_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "display_price",
      header: "Display Price",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {formatRupiah(row.original.display_price)}
        </div>
      ),
    },
    {
      accessorKey: "inbound_date",
      header: "Inbound Date",
      cell: ({ row }) => {
        const formated = format(
          new Date(row.original.inbound_date),
          "iiii, dd MMMM yyyy"
        );
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Export Data</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingExportDay}
              onClick={(e) => {
                e.preventDefault();
                handleExportDay(row.original.inbound_date);
              }}
            >
              {isPendingExportDay ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const handleExport = async () => {
    mutateExport(
      {
        searchParams: {
          date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
          date_to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
        },
      },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
  };

  const handleExportDay = async (dateInbound: string) => {
    mutateExportDay(
      {
        searchParams: {
          date_from: format(new Date(dateInbound), "yyyy-MM-dd"),
        },
      },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
  };

  useEffect(() => {
    refetch();
  }, [date]);

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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Summary Report Product Inbound</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">Summary Inbound</h2>
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
              <div className="px-3 h-10 py-1 border rounded flex gap-3 items-center text-sm border-gray-500">
                <p>
                  {dataInbound?.date?.current_date?.date ??
                    "Tanggal tidak tersedia"}
                </p>
                {/* Range Date */}
                {dataInbound?.date?.date_from?.date && (
                  <>
                    <p className="w-[1px] h-full bg-black" />
                    <p>
                      {`${dataInbound?.date?.date_from?.date ?? "-"} ${
                        dataInbound?.date?.date_from?.month ?? ""
                      } ${dataInbound?.date?.date_from?.year ?? ""}
                         -${dataInbound?.date?.date_to?.date ?? "-"} ${
                        dataInbound?.date?.date_to?.month ?? ""
                      } ${dataInbound?.date?.date_to?.year ?? ""}`}
                    </p>
                    <button onClick={clearRange}>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </>
                )}
                <p className="w-[1px] h-full bg-black" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button onClick={() => {}}>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-auto max-w-5xl p-3 border-gray-300">
                    <DialogHeader>
                      <DialogTitle>Pick a Date Range</DialogTitle>
                    </DialogHeader>
                    <div className="w-full flex items-center gap-4 text-sm">
                      <div className="w-full items-center flex justify-start px-3 border border-sky-400/80 rounded h-9">
                        <CalendarIcon className="size-4 mr-2" />
                        {(date?.from && format(date.from, "MMMM dd, yyyy")) ??
                          "Pick a date"}{" "}
                        -{" "}
                        {(date?.to && format(date.to, "MMMM dd, yyyy")) ??
                          "Pick a date"}
                      </div>

                      <Popover
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        modal={false}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            className="flex-none border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 rounded"
                            variant={"outline"}
                            size={"icon"}
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-fit" align="end">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 7),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  Last Week
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 30),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  Last Month
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 60),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  2 Months ago
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 90),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  3 Months ago
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="w-full p-2 border rounded border-sky-400/80">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={subDays(new Date(), 30)}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                disabled={isPendingExport}
                variant={"outline"}
              >
                {isPendingExport ? (
                  <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                ) : (
                  <FileDown className={"w-4 h-4 mr-1"} />
                )}
                Export Data
              </Button>
            </div>
          </div>
          {dataInbound?.status === false ? (
            <div className="w-full text-center py-10 text-red-500 font-semibold">
              {dataInbound?.message ??
                "Terjadi kesalahan, data tidak tersedia."}
            </div>
          ) : (
            <DataTable columns={columnDestinationMC} data={dataList ?? []} />
          )}{" "}
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
