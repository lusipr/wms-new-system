"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DollarSign,
  FileDown,
  LayoutGrid,
  LayoutList,
  Loader,
  Loader2,
  Package,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatRupiah } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useGetStorageReport } from "../_api/use-get-storage-report";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import { useExportStorageReport } from "../_api/use-export-storage-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useExportStorageReportByMonthByYear } from "../_api/use-export-storage-report-by-month-by-year";

interface ChartData {
  category_product: string;
  total_category: number;
  total_price_category: string;
  days_since_created: string;
}

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
      <div className="bg-white rounded px-3 py-1.5 border border-gray-300 text-xs dark:bg-gray-900 shadow-sm">
        <p className="text-sm font-bold">{label}</p>
        <div className="mb-2 bg-gray-500 dark:bg-gray-300 w-full h-px" />
        <div className="flex flex-col gap-1">
          {
            <div className="flex w-full gap-4 justify-between">
              <p>Qty:</p>
              <p>{payload[0].value.toLocaleString()}</p>
            </div>
          }
          {
            <div className="flex w-full gap-4 justify-between">
              <p>Value:</p>
              <p>{formatRupiah(payload[0].payload.total_price_category)}</p>
            </div>
          }
        </div>
      </div>
    );
  }
  return null;
};

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
    accessorKey: "category_product",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="break-all max-w-500px">
        {row.original.category_product}
      </div>
    ),
  },
  {
    accessorKey: "total_category",
    header: () => <div className="text-center">Total Product</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.total_category}
      </div>
    ),
  },
  {
    accessorKey: "total_price_category",
    header: "Value Product",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.total_price_category);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
];

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "list",
  });

  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportStorageReport();
  const { data, refetch, isPending, isRefetching, isLoading, isError, error } =
    useGetStorageReport();
  const { mutate: exportByMonthYear, isPending: isPendingExportByMonthByYear } =
    useExportStorageReportByMonthByYear();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loading = isPending || isRefetching || isLoading;

  const dataStorage = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataChart: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart.category;
  }, [data]);

  const dataChartStaging: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart_staging.category;
  }, [data]);

  const dataChartDump: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart_dump.category;
  }, [data]);

  const dataChartScrapQcd: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart_scrap_qcd.category;
  }, [data]);

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
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

  const handleExportByMonthByYear = () => {
    if (selectedMonth && selectedYear) {
      exportByMonthYear(
        { month: selectedMonth, year: selectedYear },
        {
          onSuccess: (res) => {
            const link = document.createElement("a");
            link.href = res.data.url;
            link.download = res.data.filename || "report.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsModalOpen(false);
          },
          onError: () => {
            alert("An error occurred while exporting the report.");
          },
        }
      );
    } else {
      alert("Please select both month and year.");
    }
  };

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
          <BreadcrumbItem>Storage Report</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">Report Product Per-Category</h2>
          <div className="flex gap-2">
            {dataStorage && (
              <p className="px-5 h-10 border rounded flex items-center text-sm border-gray-500 cursor-default">
                {dataStorage?.month.current_month.month +
                  " " +
                  dataStorage?.month.current_month.year}
              </p>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center border border-l-none rounded border-gray-500 hover:bg-sky-100"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-sky-400/80 hover:bg-sky-400 text-white rounded"
                  onClick={() => setIsModalOpen(true)}
                >
                  Export by Month & Year
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="w-auto max-w-md p-4 border-gray-300">
                <DialogHeader>
                  <DialogTitle>Select Month and Year</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-sky-400/80 rounded px-3 py-2">
                      <CalendarIcon className="w-4 h-4" />
                      <select
                        className="outline-none bg-transparent"
                        value={selectedMonth || ""}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                      >
                        <option value="" disabled>
                          Select Month
                        </option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {format(new Date(2025, i, 1), "MMMM")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 border border-sky-400/80 rounded px-3 py-2">
                      <CalendarIcon className="w-4 h-4" />
                      <select
                        className="outline-none bg-transparent"
                        value={selectedYear || ""}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                      >
                        <option value="" disabled>
                          Select Year
                        </option>
                        {Array.from({ length: 5 }, (_, i) => (
                          <option key={i} value={2025 - i}>
                            {2025 - i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleExportByMonthByYear}
                    className="w-full px-4 py-2 bg-sky-400/80 hover:bg-sky-400 text-white rounded"
                    disabled={isPendingExportByMonthByYear}
                  >
                    {isPendingExportByMonthByYear ? "Exporting..." : "Export"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            {/* <ExportByMonthYearButton /> */}
          </div>
        </div>
        <div className="h-75 w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataChart}
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
                    props.height > 250 ? [75, 125, 175, 225] : [100, 200]
                  }
                />
                <YAxis
                  padding={{ top: 10 }}
                  dataKey={"total_category"}
                  style={{ fontSize: "14px" }}
                  tick={false}
                  width={0}
                  axisLine={false}
                />
                <XAxis
                  dataKey="category_product"
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
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label as string}
                    />
                  )}
                />
                <Bar
                  dataKey="total_category"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">
            Report Product Per-Category (Staging)
          </h2>
        </div>
        <div className="h-75 w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataChartStaging}
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
                    props.height > 250 ? [75, 125, 175, 225] : [100, 200]
                  }
                />
                <YAxis
                  padding={{ top: 10 }}
                  dataKey={"total_category"}
                  style={{ fontSize: "14px" }}
                  tick={false}
                  width={0}
                  axisLine={false}
                />
                <XAxis
                  dataKey="category_product"
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
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label as string}
                    />
                  )}
                />
                <Bar
                  dataKey="total_category"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">Report Product Dump</h2>
        </div>
        <div className="h-75 w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataChartDump}
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
                    props.height > 250 ? [75, 125, 175, 225] : [100, 200]
                  }
                />
                <YAxis
                  padding={{ top: 10 }}
                  dataKey={"total_category"}
                  style={{ fontSize: "14px" }}
                  tick={false}
                  width={0}
                  axisLine={false}
                />
                <XAxis
                  dataKey="category_product"
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
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label as string}
                    />
                  )}
                />
                <Bar
                  dataKey="total_category"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">Report Product Scrap Qcd</h2>
        </div>
        <div className="h-75 w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataChartScrapQcd}
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
                    props.height > 250 ? [75, 125, 175, 225] : [100, 200]
                  }
                />
                <YAxis
                  padding={{ top: 10 }}
                  dataKey={"total_category"}
                  style={{ fontSize: "14px" }}
                  tick={false}
                  width={0}
                  axisLine={false}
                />
                <XAxis
                  dataKey="category_product"
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
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label as string}
                    />
                  )}
                />
                <Bar
                  dataKey="total_category"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="flex flex-col w-full gap-4">
        <Card className="w-full bg-blue-200 rounded-md overflow-hidden shadow border-0">
          <CardHeader>
            <CardTitle>Total All Product</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row gap-6">
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-sky-100">
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-semibold">Quantity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {dataStorage?.total_all_product.toLocaleString()}
                  </span>
                  <div className="flex items-center text-sky-600 text-sm font-medium border py-0.5 px-2 rounded-full border-sky-600">
                    <span>{dataStorage?.total_percentage_product}%</span>
                  </div>
                </div>
              </div>
              <Progress
                value={dataStorage?.total_percentage_product}
                className="h-1.5 bg-gray-200"
              />
            </div>
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-sky-100">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-semibold">Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatRupiah(dataStorage?.total_all_price)}
                  </span>
                  <div className="flex items-center text-sky-600 text-sm font-medium border py-0.5 px-2 rounded-full border-sky-600">
                    <span>{dataStorage?.total_percentage_price}%</span>
                  </div>
                </div>
              </div>
              <Progress
                value={dataStorage?.total_percentage_price}
                className="h-1.5 bg-gray-200"
              />
            </div>
          </CardContent>
        </Card>
        <div className="w-full flex gap-4">
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Display</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_display.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>{dataStorage?.percentage_product_display}%</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_display}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(dataStorage?.total_product_display_price)}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {dataStorage?.percentage_product_display_price}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_display_price}
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Staging</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_staging.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>{dataStorage?.percentage_product_staging}%</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_staging}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(dataStorage?.total_product_staging_price)}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {dataStorage?.percentage_product_staging_price}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_staging_price}
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full flex gap-4">
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Dump</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_dump.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>{dataStorage?.percentage_product_dump}%</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_dump}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(dataStorage?.total_product_dump_price)}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>{dataStorage?.percentage_product_dump_price}%</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_dump_price}
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Scrap Qcd</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_scrap_qcd.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>{dataStorage?.percentage_product_scrap_qcd}%</span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_scrap_qcd}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(dataStorage?.total_product_scrap_qcd_price)}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {dataStorage?.percentage_product_scrap_qcd_price}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_scrap_qcd_price}
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* <div className="w-full flex gap-4">
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Category Slow Moving</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_category_slow_moving.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {dataStorage?.percentage_product_category_slow_moving}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_category_slow_moving}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(
                        dataStorage?.total_product_category_slow_moving_price
                      )}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {
                          dataStorage?.percentage_product_category_slow_moving_price
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    dataStorage?.percentage_product_category_slow_moving_price
                  }
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="w-full bg-white rounded-md overflow-hidden shadow border-0">
            <CardHeader>
              <CardTitle>Product Slow Moving Staging</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <Package className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Quantity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {dataStorage?.total_product_slow_moving_staging.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {dataStorage?.percentage_product_slow_moving_staging}%
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={dataStorage?.percentage_product_slow_moving_staging}
                  className="h-1.5 bg-gray-200"
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-sky-100">
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Price
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {formatRupiah(
                        dataStorage?.total_product_slow_moving_staging_price
                      )}
                    </span>
                    <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                      <span>
                        {
                          dataStorage?.percentage_product_slow_moving_staging_price
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    dataStorage?.percentage_product_slow_moving_staging_price
                  }
                  className="h-1.5 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div> */}
        <div className="w-full bg-white rounded-md shadow flex flex-col">
          <div className="border-b py-2 border-black w-full px-6">
            <h1 className="font-bold">Product Color</h1>
          </div>
          <div className="flex items-center">
            {dataStorage?.tag_products.map((item: any) => (
              <Card
                key={item.tag_product}
                className="w-full overflow-hidden shadow-none border-none"
              >
                <CardHeader>
                  <CardTitle>{item.tag_product}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-sky-100">
                          <Package className="h-4 w-4 text-gray-700" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Quantity
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {item.total_tag_product.toLocaleString()}
                        </span>
                        <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                          <span>{item?.percentage_tag_product}%</span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={item?.percentage_tag_product}
                      className="h-1.5 bg-gray-200"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-sky-100">
                          <DollarSign className="h-4 w-4 text-gray-700" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Price
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {formatRupiah(item.total_price_tag_product)}
                        </span>
                        <div className="flex items-center text-sky-600 text-xs font-medium border py-0.5 px-2 rounded-full border-sky-600">
                          <span>{item.percentage_price_tag_product}%</span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={item.percentage_price_tag_product}
                      className="h-1.5 bg-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-lg font-semibold">List Product Per-Category</h3>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-5" style={{ width: "60%" }}>
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
        {layout === "grid" ? (
          <div className="grid grid-cols-4 gap-4 w-full">
            {searchValue ? (
              dataChart.filter((item: any) =>
                item.category_product
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              ).length > 0 ? (
                dataChart
                  .filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .map((item: any, i: number) => (
                    <div
                      key={item.category_product + i}
                      className="flex relative w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                    >
                      <p className="text-sm font-light text-gray-700 pb-1">
                        {item.category_product}
                      </p>
                      <div className="flex flex-col">
                        <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                          {formatRupiah(item.total_price_category)}
                        </h3>
                        <h3 className="text-gray-700 font-bold text-2xl">
                          {item.total_category.toLocaleString()}
                        </h3>
                      </div>
                      <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                        {i + 1}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-400 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )
            ) : (
              dataChart.map((item: any, i: number) => (
                <div
                  key={item.category_product + i}
                  className="flex w-full relative bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                >
                  <p className="text-sm font-light text-gray-700 pb-1">
                    {item.category_product}
                  </p>
                  <div className="flex flex-col">
                    <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                      {formatRupiah(item.total_price_category)}
                    </h3>
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {item.total_category.toLocaleString()}
                    </h3>
                  </div>
                  <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                    {i + 1}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {searchValue ? (
              <DataTable
                columns={columnsStorage}
                data={
                  dataChart.filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  ) ?? []
                }
              />
            ) : (
              <DataTable columns={columnsStorage} data={dataChart ?? []} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
