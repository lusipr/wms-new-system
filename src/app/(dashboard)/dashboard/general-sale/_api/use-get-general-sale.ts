import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetGeneralSale = ({ from, to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["general-sale"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/dashboard/general-sales?from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
