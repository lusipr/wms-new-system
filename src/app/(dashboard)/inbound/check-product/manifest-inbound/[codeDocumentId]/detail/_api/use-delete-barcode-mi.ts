import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = { code_document: string };

type Error = AxiosError;

export const useDeleteBarcodeMI = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ code_document }) => {
      const res = await axios.delete(`${baseUrl}/deleteCustomBarcode`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          code_document,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Barcode successfully deleted");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Barcode failed to delete`);
        console.log("ERROR_DELETE_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
