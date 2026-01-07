import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetAnalyticSaleMonthly = ({ from, to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["analytic-sale-monthly"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/dashboard/monthly-analytic-sales?from=${from}&to=${to}`,
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
