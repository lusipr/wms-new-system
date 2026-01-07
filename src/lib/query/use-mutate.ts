import { getCookie } from "cookies-next/client";
import axios from "axios";
import type { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { MutationVariables, UseMutateConfig } from "./type";
import { errorResponse } from "./error-response";
import { useMutation } from "@tanstack/react-query";

export const useMutate = <
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined
>({
  endpoint,
  method,
  onSuccess,
  onError,
  isNotAuthorize = false,
}: UseMutateConfig<TBody, TParams, TSearchParams>) =>
  useMutation<
    AxiosResponse,
    AxiosError,
    MutationVariables<TBody, TParams, TSearchParams>
  >({
    mutationFn: async (variables) => {
      const accessToken = getCookie("accessToken");
      const config: AxiosRequestConfig = isNotAuthorize
        ? {}
        : {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };

      let url = `${baseUrl}${endpoint}`;

      function isRecord(value: any): value is Record<string, any> {
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      }

      // Handle path params
      if (
        variables &&
        "params" in variables &&
        variables.params !== undefined
      ) {
        const params = variables.params;

        if (isRecord(params)) {
          Object.entries(params).forEach(([key, val]) => {
            url = url.replace(`:${key}`, encodeURIComponent(val)); // /:id -> /2 { id: 2 }
          });
        }
      }

      // Handle query params
      if (
        variables &&
        "searchParams" in variables &&
        variables.searchParams !== undefined
      ) {
        const queryParams = new URLSearchParams(
          variables.searchParams as Record<string, any>
        ).toString();
        url += `${url.includes("?") ? "&" : "?"}${queryParams}`;
      }

      let body;

      if (variables && "body" in variables && variables.body !== undefined) {
        body = variables.body;
      }

      if (method === "get") {
        const res = await axios.get(url, config);
        return res;
      }
      if (method === "post") {
        const res = await axios.post(url, body, config);
        return res;
      }
      if (method === "put") {
        const res = await axios.put(url, body, config);
        return res;
      }
      if (method === "delete") {
        const res = await axios.delete(url, config);
        return res;
      }
      const res = await axios.patch(url, body, config);
      return res;
    },
    onSuccess: onSuccess,
    onError: (err) =>
      errorResponse({
        err,
        message: onError.message,
        title: onError.title,
      }),
  });
