import { toast } from "sonner";

import { useMutate } from "@/lib/query";

type SearchParams = {
  from: any;
  to: any;
};

export const useExportSelectedData = () => {
  const mutation = useMutate<undefined, undefined, SearchParams>({
    endpoint: "/dashboard/monthly-analytic-sales/export",
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_SELECTEF_DATA",
      message: "Selected Data failed to export",
    },
  });
  return mutation;
};
