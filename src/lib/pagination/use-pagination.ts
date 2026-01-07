import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { DataPaginationProps, MetaPageProps } from "./type";

/**
 * Custom hook untuk mengelola paginasi berbasis query parameter `?p=` dan metadata pagination.
 *
 * Cocok digunakan di halaman yang memerlukan paginasi dan ingin menyimpan state `page`
 * ke dalam URL (menggunakan `useQueryState`), sekaligus mengelola data meta pagination
 * seperti total, per page, halaman terakhir, dll.
 *
 * @returns
 * - `page` (number): Nomor halaman saat ini (dari query string `?p=`).
 * - `setPage` (function): Setter untuk mengubah halaman (update `?p=` di URL).
 * - `metaPage` (object): Metadata pagination (last, from, total, perPage).
 * - `setMetaPage` (function): Setter untuk `metaPage`.
 * - `setPagination` (function): Utility untuk update pagination dari response backend.
 *
 * Example Usage:
 * ```ts
 *    const { page, setPage, setPagination, metaPage } = usePagination();
 *    const { data, ... } = useGet({ p: page });
 *
 *    useEffect(() => {
 *        if (isSuccess) setPagination(data?.data.data.resource);
 *    }, [isSuccess, data]);
 *
 *    return <Pagination pagination={{ ...metaPage, current: page }} setPagination={setPage} />;
 * ```
 */

export const usePagination = (indicator: string = "p") => {
  const [page, setPage] = useQueryState(
    indicator,
    parseAsInteger.withDefault(1)
  );
  const [metaPage, setMetaPage] = useState<MetaPageProps>({
    last: 1,
    from: 1,
    total: 1,
    perPage: 1,
  });

  const setPagination = (dataPaginate: DataPaginationProps) => {
    const currentPage = dataPaginate.current_page ?? 1;
    const lastPage = dataPaginate.last_page ?? 1;

    setPage(currentPage > lastPage ? 1 : currentPage);
    setMetaPage({
      last: lastPage,
      from: dataPaginate.from ?? 0,
      total: dataPaginate.total ?? 0,
      perPage: dataPaginate.per_page ?? 0,
    });
  };

  return { page, setPage, metaPage, setMetaPage, setPagination };
};
