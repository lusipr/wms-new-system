import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  tableSource: string;
  body: any;
};

type Error = AxiosError;

export const useUpdateProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, tableSource, body }) => {
      const res = await axios.put(
        `${baseUrl}/update_product/${tableSource}/${id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully updated");
      queryClient.invalidateQueries({ queryKey: ["refresh-history-document"] });
      queryClient.invalidateQueries({ queryKey: ["detail-check-history"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail-check-history"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to update`);
        console.log("ERROR_UPDATE_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
