import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useExportTemplate = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/exportTemplateBulking`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: (err) => {
      console.log("ERROR_EXPORT_TEMPLATE_BULKING:", err);
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        const message =
          err?.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data
            ? err.response.data.message
            : "Detail B2B failed to export";
        toast.error(`ERROR ${err?.status}: ${message}`);
        console.log("ERROR_EXPORT_DETAIL_B2B:", err);
      }
    },
  });
  return mutation;
};
