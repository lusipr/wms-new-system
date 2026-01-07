import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailAccount = ({ id }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["account-detail", id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!id,
  });
  return query;
};
