import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
  isAPK: boolean;
};

type Error = AxiosError;

export const useCreateTagColor = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body, isAPK }) => {
      const res = await axios.post(
        `${baseUrl}/${isAPK ? "color_tags2" : "color_tags"}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return mutation;
};
