import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = FormData;

type Error = AxiosError;

export const useUploadInbound = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/generate`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onError: (err) => {
      console.log("ERROR_GENERATE_FILE:", err);
    },
  });
  return mutation;
};
