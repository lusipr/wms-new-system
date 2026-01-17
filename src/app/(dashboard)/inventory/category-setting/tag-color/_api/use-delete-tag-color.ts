import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  isAPK: boolean;
};

type Error = AxiosError;

export const useDeleteTagColor = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, isAPK }) => {
      const res = await axios.delete(
        `${baseUrl}/${isAPK ? "color_tags2" : "color_tags"}/${id}`,
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
