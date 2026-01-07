import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListRole = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-role"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/roles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
