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
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Loader,
  RefreshCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAnalyticSaleMonthly } from "../_api/use-get-analytic-sale-monthly";
import { useGetAnalyticSaleYearly } from "../_api/use-get-analytic-sale-yearly";
import { Skeleton } from "@/components/ui/skeleton";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";

const ContentLegendMonthly = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex w-full justify-center gap-x-6 items-center text-xs flex-wrap mt-5">
      {payload.map((item: any, i: any) => (
        <div
          key={item.value + i}
          className="flex gap-x-2 items-center capitalize"
        >
          <div
            className="h-2 w-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          {item.value}
        </div>
      ))}
    </ul>
  );
};
const ContentLegendAnnualy = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex w-full justify-center gap-x-6 items-center text-xs flex-wrap mt-5">
      {payload.map((item: any, i: number) => (
        <div
          key={item.value + i}
          className="flex gap-x-2 items-center capitalize"
        >
          <div
            className="h-2 w-3 rounded"
            style={{ backgroundColor: item.color }}
          />
          {item.value}
        </div>
      ))}
    </ul>
  );
};
const ContentTooltipMonthly = ({
  active,
  payload,
  label,
}: {
  active: boolean | undefined;
  payload: any;
  label: any;
}) => {
  if (active && payload && label) {
    return (
      <div className="bg-white rounded px-3 py-1.5 border text-xs dark:bg-gray-900 shadow-sm">
        <p className="text-sm font-bold my-2">{label}</p>
        <div className="mb-2 bg-gray-500 dark:bg-gray-300 w-full h-px" />
        <div className="flex flex-col">
          <p className="font-bold mb-2">Quantity:</p>
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center">
              <p
                className="w-3 h-2 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-center w-full gap-2">
                <p className="text-black w-full">{item.name}</p>
                <p className="flex flex-none whitespace-nowrap">
                  : {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const columnsAnalytic: ColumnDef<any>[] = [
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
    accessorKey: "product_category_sale",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="break-all max-w-500px">
        {row.original.product_category_sale}
      </div>
    ),
  },
  {
    accessorKey: "total_category",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.total_category}
      </div>
    ),
  },
  {
    accessorKey: "display_price_sale",
    header: "Display Price",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.display_price_sale);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
  {
    accessorKey: "purchase",
    header: "Sale Price",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.purchase);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
];

const colorPalette = [
  "#a3e635",
  "#475569",
  "#dc2626",
  "#2dd4bf",
  "#f97316",
  "#facc15",
  "#9ca3af",
  "#22c55e",
  "#0ea5e9",
  "#6d28d9",
  "#c084fc",
  "#fb7185",
  "#be123c",
  "#020617",
  "#854d0e",
  "#f87171",
];

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "list",
  });
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [colorMapMonthly, setColorMapMonthly] = useState<{
    [key: string]: string;
  }>({});
  const [colorMapAnnualy, setColorMapAnnualy] = useState<{
    [key: string]: string;
  }>({});

  const {
    data: dataMonthly,
    refetch: refetchMonthly,
    isPending: isPendingMonthly,
    isRefetching: isRefetchingMonthly,
    isLoading: isLoadingMonthly,
    isError: isErrorMonthly,
    error: errorMonthly,
  } = useGetAnalyticSaleMonthly({
    from: date?.from ? format(date.from, "dd-MM-yyyy") : "",
    to: date?.to ? format(date.to, "dd-MM-yyyy") : "",
  });
  const {
    data: dataYearly,
    refetch: refetchYearly,
    isPending: isPendingYearly,
    isRefetching: isRefetchingYearly,
    isLoading: isLoadingYearly,
    isError: isErrorYearly,
    error: errorYearly,
  } = useGetAnalyticSaleYearly(year);

  const loadingMonthly =
    isPendingMonthly || isRefetchingMonthly || isLoadingMonthly;
  const loadingYearly =
    isPendingYearly || isRefetchingYearly || isLoadingYearly;

  const monthlyData = useMemo(() => {
    return dataMonthly?.data.data.resource;
  }, [dataMonthly]);

  const monthlyChart: any[] = useMemo(() => {
    return dataMonthly?.data.data.resource.chart;
  }, [dataMonthly]);

  const yearlyData = useMemo(() => {
    return dataYearly?.data.data.resource;
  }, [dataYearly]);

  const yearlyChart: any[] = useMemo(() => {
    return dataYearly?.data.data.resource.chart;
  }, [dataYearly]);

  const clearRange = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDate({ from: undefined, to: undefined });
  };

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
  };

  useEffect(() => {
    const uniqueKeysMonthly = Array.from(
      monthlyChart
        ? monthlyChart.reduce((keys: any, entry: any) => {
            Object.keys(entry).forEach((key) => {
              if (key !== "date") {
                keys.add(key);
              }
            });
            return keys;
          }, new Set<string>())
        : [].reduce((keys: any, entry: any) => {
            Object.keys(entry).forEach((key) => {
              if (key !== "date") {
                keys.add(key);
              }
            });
            return keys;
          }, new Set<string>())
    );

    const newColorMapMonthly: { [key: string]: string } = {};
    uniqueKeysMonthly.forEach((key: any, index: any) => {
      // Use existing color or generate a new color if palette is exhausted
      newColorMapMonthly[key] =
        colorPalette[index] ||
        `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    });

    setColorMapMonthly(newColorMapMonthly);
  }, [date, monthlyChart]);

  useEffect(() => {
    const uniqueKeysAnnualy = Array.from(
      yearlyChart
        ? yearlyChart.reduce((keys: any, entry: any) => {
            Object.keys(entry).forEach((key) => {
              if (
                key !== "month" &&
                key !== "total_all_category" &&
                key !== "display_price_sale" &&
                key !== "purchase"
              ) {
                keys.add(key);
              }
            });
            return keys;
          }, new Set<string>())
        : [].reduce((keys: any, entry: any) => {
            Object.keys(entry).forEach((key) => {
              if (
                key !== "month" &&
                key !== "total_all_category" &&
                key !== "display_price_sale" &&
                key !== "purchase"
              ) {
                keys.add(key);
              }
            });
            return keys;
          }, new Set<string>())
    );

    const newColorAnnualy: { [key: string]: string } = {};
    uniqueKeysAnnualy.forEach((key: any, index: any) => {
      // Use existing color or generate a new color if palette is exhausted
      newColorAnnualy[key] =
        colorPalette[index] ||
        `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    });

    setColorMapAnnualy(newColorAnnualy);
  }, [year, yearlyChart]);

  const ContentTooltipAnnualy = ({
    active,
    payload,
    label,
  }: {
    active: boolean | undefined;
    payload: any;
    label: string;
  }) => {
    if (active && payload && label) {
      const currentData = yearlyData.chart.find((d: any) => d.month === label);
      return (
        <div className="bg-white rounded px-3 py-1.5 border text-xs dark:bg-gray-900 shadow-sm">
          <p className="text-sm font-bold my-2">{label}</p>
          <div className="mb-2 bg-gray-500 dark:bg-gray-300 w-full h-px" />
          <div className="flex flex-col">
            <div className="flex items-center gap-4 justify-between mb-1">
              <p className="font-bold">Total All Category:</p>
              <p>{currentData?.total_all_category.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4 justify-between mb-1">
              <p className="font-bold">Total Display Price:</p>
              <p>{formatRupiah(currentData?.display_price_sale ?? "0")}</p>
            </div>
            <div className="flex items-center gap-4 justify-between mb-1">
              <p className="font-bold">Total Price Sale:</p>
              <p>{formatRupiah(currentData?.purchase ?? "0")}</p>
            </div>
            <p className="font-bold mb-2">Quantity:</p>
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex items-center">
                <p
                  className="w-3 h-2 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center w-full gap-2">
                  <p className="text-black w-full">{item.name}</p>
                  <p className="flex flex-none whitespace-nowrap">
                    : {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    refetchMonthly();
  }, [date]);

  useEffect(() => {
    refetchYearly();
  }, [year]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isErrorMonthly && (errorMonthly as AxiosError).status === 403) ||
    (isErrorYearly && (errorYearly as AxiosError).status === 403)
  ) {
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
          <BreadcrumbItem>Analytic Sale</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs className="w-full mt-5" defaultValue="monthly">
        <div className="relative w-full flex justify-center">
          <TabsList className="absolute -top-6 p-1 h-auto border-2 border-white shadow bg-gray-200">
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="monthly"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="annualy"
            >
              Annualy
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="monthly" className="w-full gap-4 flex flex-col">
          <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full justify-between items-center flex mb-5">
              <h2 className="text-xl font-bold">Analytic Sale Monthly</h2>
              <div className="flex gap-2">
                {monthlyData && (
                  <div className="px-3 h-10 py-1 border rounded flex gap-3 items-center text-sm border-gray-500">
                    <p>
                      {monthlyData?.month.current_month.month +
                        " " +
                        monthlyData?.month.current_month.year}
                    </p>
                    {monthlyData?.month.date_from.date !== null && (
                      <>
                        <p className="w-px h-full bg-black" />
                        <p>
                          {monthlyData?.month.date_from.date +
                            " " +
                            monthlyData?.month.date_from.month +
                            " " +
                            monthlyData?.month.date_from.year +
                            " - " +
                            (monthlyData?.month.date_to.date +
                              " " +
                              monthlyData?.month.date_to.month +
                              " " +
                              monthlyData?.month.date_to.year)}
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
                            {(date?.from &&
                              format(date.from, "MMMM dd, yyyy")) ??
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
                  onClick={() => refetchMonthly()}
                  className="w-10 h-10 flex items-center justify-center border border-l-none rounded border-gray-500 hover:bg-sky-100"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-125 w-full relative">
              {loadingMonthly ? (
                <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
                  <Loader className="w-7 h-7 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyChart}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 30,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      className="stroke-gray-200"
                      horizontalCoordinatesGenerator={(props) =>
                        props.height > 400
                          ? [40, 140, 220, 300, 380]
                          : [100, 200]
                      }
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#000"
                      label={{ fontSize: "10px", color: "#fff" }}
                      padding={{ left: 0, right: 0 }}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: "10px", height: "20px" }}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload, label }) => (
                        <ContentTooltipMonthly
                          active={active}
                          payload={payload}
                          label={label}
                        />
                      )}
                    />
                    <Legend
                      // margin={{ top: 50, bottom: 0, left: 0, right: 0 }}
                      content={<ContentLegendMonthly />}
                    />
                    {Object.keys(colorMapMonthly).map((key) => (
                      <Bar
                        stackId={"a"}
                        dataKey={key}
                        fill={colorMapMonthly[key]}
                        key={key}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="w-full flex gap-4">
            <div className="w-1/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Total Category</p>
              {loadingMonthly ? (
                <Skeleton className="w-1/5 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {(
                    monthlyData?.monthly_summary.total_category ?? "0"
                  ).toLocaleString()}
                </p>
              )}
            </div>
            <div className="w-2/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Display Price</p>
              {loadingMonthly ? (
                <Skeleton className="w-2/3 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {formatRupiah(
                    monthlyData?.monthly_summary.display_price_sale
                  )}
                </p>
              )}
            </div>
            <div className="w-2/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Sale Price</p>
              {loadingMonthly ? (
                <Skeleton className="w-2/5 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {formatRupiah(monthlyData?.monthly_summary.purchase)}
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">
                List Product Per-Category
              </h3>
              <div className="w-full flex justify-between items-center">
                <div
                  className="flex items-center gap-5"
                  style={{ width: "60%" }}
                >
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
              </div>
            </div>
            {layout === "grid" ? (
              <div className="grid grid-cols-4 gap-4 w-full">
                {searchValue ? (
                  monthlyData?.list_analytic_sale.filter((item: any) =>
                    item.product_category_sale
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  ).length > 0 ? (
                    monthlyData?.list_analytic_sale
                      .filter((item: any) =>
                        item.product_category_sale
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      )
                      .map((item: any, i: any) => (
                        <div
                          key={item.code_document_sale}
                          className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                        >
                          <div className="flex w-full items-center gap-4">
                            <p className="text-sm font-bold text-black w-full">
                              {item.product_category_sale}
                            </p>
                            <div className="flex flex-col justify-center flex-none relative w-10 h-10 items-center group">
                              <p className="w-full h-full bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full z-20">
                                {item.total_category}
                              </p>
                              <p className="text-xs font-bold absolute transition-all group-hover:-translate-x-8 px-0 group-hover:pr-3 group-hover:pl-2 h-5 bg-white rounded-l-full z-10 group-hover:h-7 flex items-center justify-center group-hover:border">
                                QTY
                              </p>
                            </div>
                          </div>
                          <div className="w-full h-px bg-gray-500 my-2" />
                          <div className="flex flex-col">
                            <p className="text-xs font-light text-gray-500">
                              Display Price
                            </p>
                            <p className="text-sm font-light text-gray-800">
                              {formatRupiah(item.display_price_sale)}
                            </p>
                          </div>
                          <div className="flex flex-col mt-2">
                            <p className="text-xs font-light text-gray-500">
                              Sale Price
                            </p>
                            <p className="text-sm font-light text-gray-800">
                              {formatRupiah(item.purchase)}
                            </p>
                          </div>
                          <p className="absolute text-end text-[100px] font-bold -bottom-8 right-2 text-gray-300/40 z-0">
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
                ) : monthlyData?.list_analytic_sale.length > 0 ? (
                  monthlyData?.list_analytic_sale.map((item: any, i: any) => (
                    <div
                      key={item.code_document_sale}
                      className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                    >
                      <div className="flex w-full items-center gap-4">
                        <p className="text-sm font-bold text-black w-full">
                          {item.product_category_sale}
                        </p>
                        <div className="flex flex-col justify-center flex-none relative w-10 h-10 items-center group">
                          <p className="w-full h-full bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full z-20">
                            {item.total_category}
                          </p>
                          <p className="text-xs font-bold absolute transition-all group-hover:-translate-x-8 px-0 group-hover:pr-3 group-hover:pl-2 h-5 bg-white rounded-l-full z-10 group-hover:h-7 flex items-center justify-center group-hover:border">
                            QTY
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-gray-500 my-2" />
                      <div className="flex flex-col">
                        <p className="text-xs font-light text-gray-500">
                          Display Price
                        </p>
                        <p className="text-sm font-light text-gray-800">
                          {formatRupiah(item.display_price_sale)}
                        </p>
                      </div>
                      <div className="flex flex-col  mt-2">
                        <p className="text-xs font-light text-gray-500">
                          Sale Price
                        </p>
                        <p className="text-sm font-light text-gray-800">
                          {formatRupiah(item.purchase)}
                        </p>
                      </div>
                      <p className="absolute text-end text-[100px] font-bold -bottom-8 right-2 text-gray-300/40 z-0">
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
                    columns={columnsAnalytic}
                    data={
                      monthlyData?.list_analytic_sale.filter((item: any) =>
                        item.product_category_sale
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      ) ?? []
                    }
                  />
                ) : (
                  <DataTable
                    columns={columnsAnalytic}
                    data={monthlyData?.list_analytic_sale ?? []}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="annualy" className="w-full gap-4 flex flex-col">
          <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full justify-between items-center flex mb-5">
              <h2 className="text-xl font-bold">Analytic Sale Annualy</h2>
              <div className="flex gap-2">
                <div className="flex">
                  <button
                    onClick={() => setYear(yearlyData?.year.prev_year.year)}
                    className="px-3 h-10 py-1 border rounded-l flex gap-3 items-center font-semibold border-gray-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setYear(yearlyData?.year.current_month.year)}
                    className="px-3 h-10 py-1 border-y flex gap-3 items-center font-semibold border-gray-500"
                  >
                    <p>{yearlyData?.year.selected_year.year}</p>
                  </button>
                  <button
                    onClick={() => setYear(yearlyData?.year.next_year.year)}
                    className="px-3 h-10 py-1 border rounded-r flex gap-3 items-center font-semibold border-gray-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => refetchYearly}
                  className="w-10 h-10 flex items-center justify-center border border-l-none rounded border-gray-500 hover:bg-sky-100"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-125 w-full relative">
              {loadingYearly ? (
                <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
                  <Loader className="w-7 h-7 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearlyChart}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 30,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      className="stroke-gray-200"
                      horizontalCoordinatesGenerator={(props) =>
                        props.height > 400
                          ? [40, 140, 220, 300, 380]
                          : [100, 200]
                      }
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#000"
                      label={{ fontSize: "10px", color: "#fff" }}
                      padding={{ left: 0, right: 0 }}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: "10px", height: "20px" }}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload, label }) => (
                        <ContentTooltipAnnualy
                          active={active}
                          payload={payload}
                          label={label as string}
                        />
                      )}
                    />
                    <Legend
                      // margin={{ top: 50, bottom: 0, left: 0, right: 0 }}
                      content={<ContentLegendAnnualy />}
                    />
                    {Object.keys(colorMapAnnualy).map((key) => (
                      <Bar
                        stackId={"a"}
                        dataKey={key}
                        fill={colorMapAnnualy[key]}
                        key={key}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="w-full flex gap-4">
            <div className="w-1/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Total Category</p>
              {loadingYearly ? (
                <Skeleton className="w-1/5 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {(
                    yearlyData?.annual_summary.total_all_category ?? "0"
                  ).toLocaleString()}
                </p>
              )}
            </div>
            <div className="w-2/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Display Price</p>
              {loadingYearly ? (
                <Skeleton className="w-2/3 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {formatRupiah(
                    yearlyData?.annual_summary.total_display_price_sale
                  ) ?? "Rp 0"}
                </p>
              )}
            </div>
            <div className="w-2/5 p-5 bg-white rounded-md overflow-hidden shadow ">
              <p className="text-sm font-light">Sale Price</p>
              {loadingYearly ? (
                <Skeleton className="w-2/5 h-7" />
              ) : (
                <p className="text-xl font-bold">
                  {formatRupiah(
                    yearlyData?.annual_summary.total_product_price_sale
                  ) ?? "Rp 0"}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">
                List Product Per-Category
              </h3>
              <div className="w-full flex justify-between items-center">
                <div
                  className="flex items-center gap-5"
                  style={{ width: "60%" }}
                >
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
              </div>
            </div>
            {layout === "grid" ? (
              <div className="grid grid-cols-4 gap-4 w-full">
                {searchValue ? (
                  yearlyData?.list_analytic_sale.filter((item: any) =>
                    item.product_category_sale
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  ).length > 0 ? (
                    yearlyData?.list_analytic_sale
                      .filter((item: any) =>
                        item.product_category_sale
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      )
                      .map((item: any, i: any) => (
                        <div
                          key={item.code_document_sale}
                          className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                        >
                          <div className="flex w-full items-center gap-4">
                            <p className="text-sm font-bold text-black w-full">
                              {item.product_category_sale}
                            </p>
                            <div className="flex flex-col justify-center flex-none relative w-10 h-10 items-center group">
                              <p className="w-full h-full bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full z-20">
                                {item.total_category}
                              </p>
                              <p className="text-xs font-bold absolute transition-all group-hover:-translate-x-8 px-0 group-hover:pr-3 group-hover:pl-2 h-5 bg-white rounded-l-full z-10 group-hover:h-7 flex items-center justify-center group-hover:border">
                                QTY
                              </p>
                            </div>
                          </div>
                          <div className="w-full h-px bg-gray-500 my-2" />
                          <div className="flex flex-col">
                            <p className="text-xs font-light text-gray-500">
                              Display Price
                            </p>
                            <p className="text-sm font-light text-gray-800">
                              {formatRupiah(item.display_price_sale)}
                            </p>
                          </div>
                          <div className="flex flex-col mt-2">
                            <p className="text-xs font-light text-gray-500">
                              Sale Price
                            </p>
                            <p className="text-sm font-light text-gray-800">
                              {formatRupiah(item.purchase)}
                            </p>
                          </div>
                          <p className="absolute text-end text-[100px] font-bold -bottom-8 right-2 text-gray-300/40 z-0">
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
                ) : yearlyData?.list_analytic_sale.length > 0 ? (
                  yearlyData?.list_analytic_sale.map((item: any, i: any) => (
                    <div
                      key={item.code_document_sale}
                      className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border relative"
                    >
                      <div className="flex w-full items-center gap-4">
                        <p className="text-sm font-bold text-black w-full">
                          {item.product_category_sale}
                        </p>
                        <div className="flex flex-col justify-center flex-none relative w-10 h-10 items-center group">
                          <p className="w-full h-full bg-gray-100 transition-all flex flex-none items-center justify-center rounded-full z-20">
                            {item.total_category}
                          </p>
                          <p className="text-xs font-bold absolute transition-all group-hover:-translate-x-8 px-0 group-hover:pr-3 group-hover:pl-2 h-5 bg-white rounded-l-full z-10 group-hover:h-7 flex items-center justify-center group-hover:border">
                            QTY
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-gray-500 my-2" />
                      <div className="flex flex-col">
                        <p className="text-xs font-light text-gray-500">
                          Display Price
                        </p>
                        <p className="text-sm font-light text-gray-800">
                          {formatRupiah(item.display_price_sale)}
                        </p>
                      </div>
                      <div className="flex flex-col  mt-2">
                        <p className="text-xs font-light text-gray-500">
                          Sale Price
                        </p>
                        <p className="text-sm font-light text-gray-800">
                          {formatRupiah(item.purchase)}
                        </p>
                      </div>
                      <p className="absolute text-end text-[100px] font-bold -bottom-8 right-2 text-gray-300/40 z-0">
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
                    columns={columnsAnalytic}
                    data={
                      yearlyData?.list_analytic_sale.filter((item: any) =>
                        item.product_category_sale
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      ) ?? []
                    }
                  />
                ) : (
                  <DataTable
                    columns={columnsAnalytic}
                    data={yearlyData?.list_analytic_sale ?? []}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
