import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetBarcodeMI = ({ code, barcode }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["check-barcode-manifest-inbound", code, barcode],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/documents/${code}/search_old_product/${barcode}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!barcode,
  });
  return query;
};
