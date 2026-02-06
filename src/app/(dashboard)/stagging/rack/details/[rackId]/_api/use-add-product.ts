import { baseUrl } from "@/lib/baseUrl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

type RequestType = {
  id: string | number;
  barcode: string;
};

export const useAddProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, RequestType>({
    mutationFn: async ({ id, barcode } : any) => {
      return axios.post(
        `${baseUrl}/racks/${id}/add-product/${barcode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },
    onSuccess: () => {
      toast.success("Product successfully added");

      queryClient.invalidateQueries({
        queryKey: ["list-product-staging-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-detail-rack"],
      });
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR ${err.response?.status}: ${
            (err.response?.data as any)?.message ||
            "Product failed to add"
          }`,
        );
      }
    },
  });
};
