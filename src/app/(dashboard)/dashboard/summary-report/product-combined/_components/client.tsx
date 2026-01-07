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
import { useGetListSummaryBoth } from "../_api/use-get-list-summary-both";
import { useExportInboundDataDay } from "../_api/use-export-summary-inbound-day";
import { useExportOutboundDataDay } from "../_api/use-export-summary-outbound-day";
import { useExportInboundData } from "../_api/use-export-summary-inbound";
import { useExportOutboundData } from "../_api/use-export-summary-outbound";

type DestinationMC = {
  date: string;
  inbound?: any;
  outbound?: any;
};

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: today,
  });
  const { mutate: mutateExportInbound, isPending: isPendingExportInbound } =
    useExportInboundData();
  const { mutate: mutateExportOutbound, isPending: isPendingExportOutbound } =
    useExportOutboundData();
  const { mutate: exportInboundDay, isPending: isPendingInbound } =
    useExportInboundDataDay();
  const { mutate: exportOutboundDay, isPending: isPendingOutbound } =
    useExportOutboundDataDay();

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
  } = useGetListSummaryBoth({
    p: page,
    q: searchValue,
    date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
    date_to: date?.to
      ? format(date.to, "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd"),
  });

  const dataBoth = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  const loading = isPending || isRefetching || isLoading;

  const clearRange = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDate({
      from: undefined,
      to: new Date(),
    });
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

  const mergeInboundOutbound = (
    inbound: any[],
    outbound: any[]
  ): DestinationMC[] => {
    const map = new Map<string, DestinationMC>();

    inbound.forEach((item) => {
      map.set(item.inbound_date, {
        date: item.inbound_date,
        inbound: item,
        outbound: undefined,
      });
    });

    outbound.forEach((item) => {
      if (map.has(item.outbound_date)) {
        map.get(item.outbound_date)!.outbound = item;
      } else {
        map.set(item.outbound_date, {
          date: item.outbound_date,
          inbound: undefined,
          outbound: item,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const tableData = useMemo(() => {
    return mergeInboundOutbound(
      dataBoth?.inbound ?? [],
      dataBoth?.outbound ?? []
    );
  }, [dataBoth]);

  const SummaryCard = ({
    title,
    value,
    qty,
    className,
  }: {
    title: string;
    value?: string | number;
    qty?: string | number;
    className?: string;
  }) => (
    <div
      className={cn(
        "rounded-md border border-gray-300 bg-white p-4 flex flex-col justify-between",
        className
      )}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <div className="mt-1">
        <p className="text-xl font-semibold">{value ?? "-"}</p>

        {qty !== undefined && (
          <p className="text-sm text-gray-600 mt-1">
            Qty: <span className="font-medium">{qty}</span>
          </p>
        )}
      </div>
    </div>
  );

  // column data
  const columnDestinationMC: ColumnDef<DestinationMC>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">{row.index + 1}</div>
      ),
    },

    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const formatted = format(
          new Date(row.original.date),
          "iiii, dd MMMM yyyy"
        );
        return <div className="tabular-nums">{formatted}</div>;
      },
    },

    {
      header: "Qty In",
      cell: ({ row }) => <div>{row.original.inbound?.qty ?? "-"}</div>,
    },

    {
      header: "Qty Out",
      cell: ({ row }) => <div>{row.original.outbound?.qty ?? "-"}</div>,
    },

    {
      header: "Old Price In",
      cell: ({ row }) => (
        <div>
          {row.original.inbound
            ? formatRupiah(row.original.inbound.old_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "Old Price Out",
      cell: ({ row }) => (
        <div>
          {row.original.outbound
            ? formatRupiah(row.original.outbound.old_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "New Price In",
      cell: ({ row }) => (
        <div>
          {row.original.inbound
            ? formatRupiah(row.original.inbound.new_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "New Price Out",
      cell: ({ row }) => (
        <div>
          {row.original.outbound
            ? formatRupiah(row.original.outbound.display_price_product)
            : "-"}
        </div>
      ),
    },

    // {
    //   id: "action",
    //   header: () => <div className="text-center">Action</div>,
    //   cell: ({ row }) => (
    //     <div className="flex gap-4 justify-center items-center">
    //       <TooltipProviderPage value={<p>Export Data</p>}>
    //         <Button
    //           className="items-center w-9 px-0 h-9"
    //           variant="outline"
    //           disabled={isPendingExportDay}
    //           onClick={(e) => {
    //             e.preventDefault();
    //             handleExportDay(row.original.date);
    //           }}
    //         >
    //           {isPendingExportDay ? (
    //             <Loader2 className="w-4 h-4 animate-spin" />
    //           ) : (
    //             <FileDown className="w-4 h-4" />
    //           )}
    //         </Button>
    //       </TooltipProviderPage>
    //     </div>
    //   ),
    // },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Popover>
            <TooltipProviderPage value={<p>Export Data</p>}>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "items-center p-0 w-9 h-9",
                    "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50",
                    "disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  )}
                  variant="outline"
                  type="button"
                  disabled={isPendingInbound || isPendingOutbound}
                >
                  {isPendingInbound || isPendingOutbound ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipProviderPage>

            <PopoverContent className="w-auto py-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start px-3 text-sm"
                  onClick={() => handleExportInboundDay(row.original.date)}
                  disabled={!row.original.inbound || isPendingInbound}
                >
                  Export Inbound
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start px-3 text-sm"
                  onClick={() => handleExportOutboundDay(row.original.date)}
                  disabled={!row.original.outbound || isPendingOutbound}
                >
                  Export Outbound
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ];

  const handleExportInbound = async () => {
    mutateExportInbound(
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

  const handleExportOutbound = async () => {
    mutateExportOutbound(
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

  const handleExportInboundDay = (date: string) => {
    exportInboundDay(
      {
        searchParams: {
          date_from: format(new Date(date), "yyyy-MM-dd"),
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

  const handleExportOutboundDay = (date: string) => {
    exportOutboundDay(
      {
        searchParams: {
          date_from: format(new Date(date), "yyyy-MM-dd"),
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
          <BreadcrumbItem>Summary Report Product</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">Summary Report</h2>
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Saldo */}
          <SummaryCard
            title="Saldo Awal"
            value={formatRupiah(dataBoth?.data_before?.inbound?.saldo_awal)}
            qty={dataBoth?.data_before?.inbound?.qty}
            className="bg-sky-200"
          />

          <SummaryCard
            title="Saldo Akhir"
            value={formatRupiah(dataBoth?.saldo_akhir)}
            qty={dataBoth?.data_before?.outbound?.qty}
            className="bg-sky-200"
          />

          {/* Qty */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard
              title="Qty Masuk"
              value={dataBoth?.data_before?.inbound?.qty}
            />
            <SummaryCard
              title="Qty Keluar"
              value={dataBoth?.data_before?.outbound?.qty}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard
              title="Price Masuk"
              value={formatRupiah(
                dataBoth?.data_before?.inbound?.display_price
              )}
            />
            <SummaryCard
              title="Price Keluar"
              value={formatRupiah(dataBoth?.data_before?.outbound?.price_sale)}
            />
          </div>
        </div>

        <div className="flex flex-col w-full gap-4">
          <h2 className="text-xl font-bold mt-4">List Summary Report</h2>
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
                {/* {date?.from && date?.to && (
                  <> */}
                {date?.from ? (
                  <p>
                    {format(date.from, "dd MMM yyyy")} -{" "}
                    {format(date.to!, "dd MMM yyyy")}
                  </p>
                ) : (
                  <p className="italic text-gray-500">
                    Until {format(date?.to ?? today, "dd MMM yyyy")}
                  </p>
                )}

                <button onClick={clearRange}>
                  <XCircle className="w-4 h-4 text-red-500" />
                </button>
                {/* </>
                )} */}
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
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportInbound();
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExportInbound}
                  variant={"outline"}
                >
                  {isPendingExportInbound ? (
                    <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                  ) : (
                    <FileDown className={"w-4 h-4 mr-1"} />
                  )}
                  Export Inbound
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportOutbound();
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExportOutbound}
                  variant={"outline"}
                >
                  {isPendingExportOutbound ? (
                    <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                  ) : (
                    <FileDown className={"w-4 h-4 mr-1"} />
                  )}
                  Export Outbound
                </Button>
              </div>
            </div>
          </div>
          {dataBoth?.status === false ? (
            <div className="w-full text-center py-10 text-red-500 font-semibold">
              {dataBoth?.message ?? "Terjadi kesalahan, data tidak tersedia."}
            </div>
          ) : (
            <DataTable columns={columnDestinationMC} data={tableData ?? []} />
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
