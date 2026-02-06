import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string | number;
  productId: string;
};

type Error = AxiosError;

export const useRemoveProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, productId }: any) => {
      return axios.delete(
        `${baseUrl}/racks/${id}/remove-product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    },

    onSuccess: () => {
      toast.success("Product successfully removed");
      queryClient.invalidateQueries({ queryKey: ["list-product-staging"] });
      queryClient.invalidateQueries({ queryKey: ["list-detail-rack"] });
      queryClient.invalidateQueries({ queryKey: ["list-product-staging-detail"] });
    },

    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${status}: Product failed to remove`);
        console.error("ERROR_REMOVE_PRODUCT:", err);
      }
    },
  });
};
