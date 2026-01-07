import { toast } from "sonner";
import { useMutate } from "@/lib/query";

type SearchParams = {
  year: any;
};

export const useExportYearData = () => {
  const mutation = useMutate<undefined, undefined, SearchParams>({
    endpoint: "/dashboard/yearly-analytic-sales/export",
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_YEAR_DATA",
      message: "Year Data failed to export",
    },
  });

  return mutation;
};
