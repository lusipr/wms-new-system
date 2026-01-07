import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
};

type Error = AxiosError;

export const useDeleteHistory = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`${baseUrl}/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifest-inbound"] });
    },
    onError: (err) => {
      console.log("ERROR_DELETE_MANIFEST_INBOUND:", err);
      // }
    },
  });
  return mutation;
};
