import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  [key: string]: string;
};

type Error = AxiosError;

export const useSubmitProduct = () => {
  const accessToken = getCookie("accessToken");

  return useMutation({
    mutationFn: async ({
      idProduct,
      body,
    }: {
      idProduct: string;
      body: any;
    }) => {
      return axios.post(`${baseUrl}/product-approve/${idProduct}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
  });
};
