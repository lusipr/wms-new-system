// src/lib/query/utils.ts
import { QueryClient } from "@tanstack/react-query";

/**
 *
 * @param key bakal di buat sesuai jumlah key
 * @example invalidateQuery([["storage-report"], ["count-staging"]]);
 */
export const invalidateQuery = (queryClient: QueryClient, keys: string[][]) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};
