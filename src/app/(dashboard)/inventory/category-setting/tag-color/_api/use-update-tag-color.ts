import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  body: any;
  isAPK: boolean;
};

type Error = AxiosError;

export const useUpdateTagColor = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body, isAPK }) => {
      const res = await axios.put(
        `${baseUrl}/${isAPK ? "color_tags2" : "color_tags"}/${id}`,
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
      toast.success(`Color successfully updated`);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Color failed to update`);
        console.log("ERROR_UPDATE_COLOR:", err);
      }
    },
  });
  return mutation;
};
