import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  code_document: string;
  custom_barcode: string;
};

type Error = AxiosError;

export const useCreateEditBarcodeMI = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/documents/custom-barcode`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Barcode Successfully Updated");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Barcode failed to update`);
        console.log("ERROR_UPDATE_BARCODE:", err);
      }
    },
  });
  return mutation;
};
