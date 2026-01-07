import { AxiosError, AxiosResponse } from "axios";

type IfDefined<T, Then> = [T] extends [undefined] ? {} : Then;

export type MutationVariables<
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined
> = IfDefined<TBody, { body: TBody }> &
  IfDefined<TParams, { params: TParams }> &
  IfDefined<TSearchParams, { searchParams: TSearchParams }>;

export type UseMutateConfig<
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined
> = {
  endpoint: string;
  method: "post" | "put" | "delete" | "patch" | "get";
  onSuccess:
    | ((
        data: AxiosResponse<any, any>,
        variables: MutationVariables<TBody, TParams, TSearchParams>,
        context: unknown
      ) => Promise<unknown> | unknown)
    | undefined;
  onError: {
    /**
     * Default message to show if server response doesn't contain one.
     */
    message: string;
    /**
     * title for error logging like "ADD_USER" it will be "ERROR_ADD_USER"
     */
    title: string;
  };
  isNotAuthorize?: boolean;
};

export type ErrorResposeType = {
  /**
   * Axios error object.
   */
  err: AxiosError;
  /**
   * Default message to show if server response doesn't contain one.
   */
  message: string;
  /**
   * title for error logging like "ADD_USER" it will be "ERROR_ADD_USER"
   */
  title: string;
};
