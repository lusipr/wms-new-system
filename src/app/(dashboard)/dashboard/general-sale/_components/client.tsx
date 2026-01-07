"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowUpRight,
  ArrowUpRightFromSquare,
  CalendarIcon,
  ChevronDown,
  FileDown,
  LayoutGrid,
  LayoutList,
  Loader,
  Loader2,
  RefreshCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatRupiah } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryState } from "nuqs";
import { useGetGeneralSale } from "../_api/use-get-general-sale";
import { Calendar } from "@/components/ui/calendar";
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
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import Link from "next/link";
import { useExportYearData } from "../_api/use-export-year";
import { useExportSelectedData } from "../_api/use-export-sale";

interface ChartData {
  date: string;
  total_price_sale: number;
  total_display_price: number;
}

const ContentLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex w-full justify-center gap-x-6 items-center text-xs">
      {payload.map((item: any, i: number) => (
        <div key={item.id + i} className="flex gap-x-2 items-center capitalize">
          <div
            className={cn(
              "h-2 w-3 rounded",
              item.value === "total_display_price" && "bg-red-500",
              item.value === "total_price_sale" && "bg-sky-500"
            )}
          />
          {item.value === "total_price_sale" && "Sale Price"}
        </div>
      ))}
    </ul>
  );
};

const ContentTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean | undefined;
  payload: any;
  label: string;
}) => {
  if (active && payload && label) {
    return (
      <div className="bg-white rounded px-3 py-1.5 border text-xs dark:bg-gray-900 shadow-sm">
        <p className="text-sm font-bold">{label}</p>
        <div className="mb-2 bg-gray-500 dark:bg-gray-300 w-full h-px" />
        <p>Sale Price: {formatRupiah(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const columnsTopTenBuyer: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.index + 1).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "name_buyer",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="break-all max-w-125">
        {row.original.buyer.name_buyer}
      </div>
    ),
  },
  {
    accessorKey: "total_point",
    header: "Total Point",
  },
];

export const columnsStorage: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.index + 1).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "code_document_sale",
    header: "Document Code",
  },
  {
    accessorKey: "buyer_name_document_sale",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="break-all max-w-125">
        {row.original.buyer_name_document_sale}
      </div>
    ),
  },
  {
    accessorKey: "total_purchase",
    header: "Sale Price",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.total_purchase);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Button
          className="bg-sky-300/80 hover:bg-sky-300 text-black h-8 font-normal rounded"
          asChild
        >
          <Link
            href={`/outbond/sale/detail/${row.original.id}`}
            target="_blank"
          >
            <ArrowUpRightFromSquare className="size-2" />
            Detail
          </Link>
        </Button>
      </div>
    ),
  },
];

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "list",
  });
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { mutate: mutateExportYear, isPending: isPendingExportYear } =
    useExportYearData();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportSelectedData();

  const { data, refetch, isPending, isRefetching, isLoading, isError, error } =
    useGetGeneralSale({
      from: date?.from ? format(date.from, "dd-MM-yyyy") : "",
      to: date?.to ? format(date.to, "dd-MM-yyyy") : "",
    });

  const loading = isPending || isRefetching || isLoading;

  const dataSale = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataChart: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart;
  }, [data]);

  const clearRange = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDate({ from: undefined, to: undefined });
  };

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
  };

  const handleExportYear = async () => {
    mutateExportYear(
      { searchParams: { year: new Date().getFullYear().toString() } },
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

  const handleExport = async () => {
    mutateExport(
      {
        searchParams: {
          from: date?.from ? format(date.from, "dd-MM-yyyy") : "",
          to: date?.to ? format(date.to, "dd-MM-yyyy") : "",
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

  if (isError && (error as AxiosError).status === 403) {
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
          <BreadcrumbItem>General Sale</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">General Sale</h2>
          <div className="flex gap-2">
            {dataSale && (
              <div className="px-3 h-10 py-1 border rounded flex gap-3 items-center text-sm border-gray-500">
                <p>
                  {dataSale?.month.current_month.month +
                    " " +
                    dataSale?.month.current_month.year}
                </p>
                {dataSale?.month.date_from.date !== null && (
                  <>
                    <p className="w-px h-full bg-black" />
                    <p>
                      {dataSale?.month.date_from.date +
                        " " +
                        dataSale?.month.date_from.month +
                        " " +
                        dataSale?.month.date_from.year +
                        " - " +
                        (dataSale?.month.date_to.date +
                          " " +
                          dataSale?.month.date_to.month +
                          " " +
                          dataSale?.month.date_to.year)}
                    </p>
                    <button onClick={clearRange}>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </>
                )}
                <p className="w-px h-full bg-black" />
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
            )}
            <button
              type="button"
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center border border-l-none rounded border-gray-500 hover:bg-sky-100"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-75 w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dataChart}
                margin={{
                  top: 5,
                  right: 10,
                  left: 30,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <YAxis hide />
                <XAxis
                  dataKey="date"
                  stroke="#000"
                  fontSize={12}
                  padding={{ left: 0, right: 0 }}
                  tickMargin={10}
                  style={{ fontSize: "10px" }}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => (
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label as string}
                    />
                  )}
                />
                <Legend content={<ContentLegend />} />
                <Area
                  type={"natural"}
                  dataKey="total_price_sale"
                  stroke="#0ea5e9"
                  fill="url(#fillColor)"
                  fillOpacity={0.4}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">Top 10 Buyers</h2>
        <div className="flex flex-col w-full gap-4">
          <DataTable
            columns={columnsTopTenBuyer}
            data={dataSale?.list_top_buyer ?? []}
          />
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
        <div className="w-full flex justify-between items-center gap-5">
          <div className="flex items-center gap-5 w-2/3">
            <div className="relative w-full flex items-center mb-0">
              <Label className="absolute left-3" htmlFor="search">
                <Search className="w-4 h-4" />
              </Label>
              <input
                id="search"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
              />
              <button
                onClick={clearSearch}
                className={cn(
                  "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                  dataSearch.length > 0 ? "flex" : "hidden"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex border border-gray-500 rounded flex-none h-9 overflow-hidden">
              <button
                className={cn(
                  "w-9 h-full flex items-center justify-center outline-none",
                  layout === "list" ? "bg-sky-300" : "bg-transparent"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setLayout("list");
                }}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  "w-9 h-full flex items-center justify-center outline-none",
                  layout === "grid" ? "bg-sky-300" : "bg-transparent"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setLayout("grid");
                }}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleExportYear();
              }}
              className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingExport || isPendingExportYear}
              variant={"outline"}
            >
              {isPendingExport || isPendingExportYear ? (
                <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
              ) : (
                <FileDown className={"w-4 h-4 mr-1"} />
              )}
              Export Year Data
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleExport();
              }}
              className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingExport || isPendingExportYear}
              variant={"outline"}
            >
              {isPendingExport || isPendingExportYear ? (
                <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
              ) : (
                <FileDown className={"w-4 h-4 mr-1"} />
              )}
              Export Data
            </Button>
          </div>
        </div>
        {layout === "grid" ? (
          <div className="grid grid-cols-4 gap-4 w-full">
            {searchValue ? (
              dataSale?.list_document_sale.filter((item: any) =>
                item.code_document_sale
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              ).length > 0 ? (
                dataSale?.list_document_sale
                  .filter((item: any) =>
                    item.code_document_sale
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .map((item: any, i: any) => (
                    <div
                      key={item.code_document_sale}
                      className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                    >
                      <div className="flex w-full items-center">
                        <div className="w-full flex flex-col">
                          <p className="text-sm font-light text-gray-500">
                            {item.code_document_sale}
                          </p>
                          <h3 className="text-gray-700 font-bold text-base">
                            {item.buyer_name_document_sale}
                          </h3>
                        </div>
                        <button
                          onClick={() => {}}
                          className="w-10 h-10 hover:bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M7 7h10v10" />
                            <path d="M7 17 17 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="w-full h-px bg-gray-500 my-2" />
                      <div className="flex flex-col">
                        <p className="text-xs font-light text-gray-500">
                          Sale Price
                        </p>
                        <p className="text-sm font-light text-gray-800">
                          {formatRupiah(item.total_purchase)}
                        </p>
                      </div>
                      <p className="absolute text-end text-[100px] font-bold bottom-8 right-2 text-gray-300/20 z-0">
                        {i + 1}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )
            ) : dataSale?.list_document_sale.length > 0 ? (
              dataSale?.list_document_sale.map((item: any, i: any) => (
                <div
                  key={item.code_document_sale}
                  className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                >
                  <div className="flex w-full items-center">
                    <div className="w-full flex flex-col">
                      <p className="text-sm font-light text-gray-500">
                        {item.code_document_sale}
                      </p>
                      <h3 className="text-gray-700 font-bold text-base">
                        {item.buyer_name_document_sale}
                      </h3>
                    </div>
                    <button
                      onClick={() => {}}
                      className="w-10 h-10 hover:bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-full h-px bg-gray-500 my-2" />
                  <div className="flex flex-col">
                    <p className="text-xs font-light text-gray-500">
                      Sale Price
                    </p>
                    <p className="text-sm font-light text-gray-800">
                      {formatRupiah(item.total_purchase)}
                    </p>
                  </div>
                  <p className="absolute text-end text-[60px] font-bold -bottom-4 right-3 text-gray-300/40 z-0">
                    {i + 1}
                  </p>
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                <div className="w-full flex-none text-center font-semibold">
                  No Data Viewed.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {searchValue ? (
              <DataTable
                columns={columnsStorage}
                data={
                  dataSale?.list_document_sale.filter(
                    (item: any) =>
                      item.buyer_name_document_sale
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                      item.code_document_sale
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                  ) ?? []
                }
              />
            ) : (
              <DataTable
                columns={columnsStorage}
                data={dataSale?.list_document_sale ?? []}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
