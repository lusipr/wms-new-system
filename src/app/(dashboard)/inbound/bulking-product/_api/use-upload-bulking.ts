import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = {
  value: FormData;
  type: string;
};

type Error = AxiosError;

export const useUploadBulking = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ value, type }) => {
      const res = await axios.post(
        `${baseUrl}/bulking/product/category`,
        value,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onError: (err) => {
      console.log("ERROR_UPLOAD_FILE:", err);
    },
  });
  return mutation;
};
