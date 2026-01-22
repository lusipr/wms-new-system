import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCreateBundle = ({ p }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["data-create-bundle", { p }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/bundle/filter-product?page=${p}`,
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
