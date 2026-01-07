import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiGMaps = process.env.NEXT_PUBLIC_API_GMAPS!;

export function formatRupiah(rupiah: number) {
  if (rupiah) {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
    return formatter.format(Math.ceil(rupiah));
  }
  return "Rp 0";
}

export const setPaginate = ({
  isSuccess,
  data,
  dataPaginate,
  setPage,
  setMetaPage,
}: {
  isSuccess: boolean;
  data: any;
  dataPaginate: any;
  setPage: any;
  setMetaPage: any;
}) => {
  if (isSuccess && data) {
    if (dataPaginate.last_page < dataPaginate.current_page) {
      setPage(1);
    } else {
      setPage(dataPaginate.current_page ?? 1);
    }
    setMetaPage({
      last: dataPaginate.last_page ?? 1,
      from: dataPaginate.from ?? 0,
      total: dataPaginate.total ?? 0,
      perPage: dataPaginate.per_page ?? 0,
    });
  }
};

export const alertError = ({
  isError,
  error,
  data,
  action,
  method,
}: {
  isError: boolean;
  error: AxiosError;
  data: string;
  action: string;
  method: string;
}) => {
  if (isError && error.status === 403) {
    toast.error(`Error 403: Restricted Access`);
  }
  if (isError && error.status !== 403) {
    toast.error(`ERROR ${error.status}: ${data} failed to ${action}`);
    console.log(
      `ERROR_${method.toUpperCase()}_${data
        .split(" ")
        .join("_")
        .toUpperCase()}:`,
      error
    );
  }
};

export const promiseToast = <T>({
  promise,
  loading,
  success,
  error,
}: {
  promise: Promise<T>;
  loading: string;
  success: ((data: T) => string) | string;
  error: ((err: AxiosError) => string) | string;
}) => {
  return toast.promise(promise, {
    loading,
    success: (data) =>
      typeof success === "function" ? success(data) : success,
    error: (err: AxiosError) => {
      if (err.status === 403) {
        return "Error 403: Restricted Access";
      } else {
        return `ERROR ${err?.status}: ${
          typeof error === "function" ? error(err) : error
        }`;
      }
    },
  });
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteString = atob(base64.split(",")[1]); // Decode Base64
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeType });
};

export const numericString = (e: string) => {
  return e.startsWith("0") ? e.replace(/^0+/, "") : e;
};

export const sizesImage =
  "(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 100vw";
