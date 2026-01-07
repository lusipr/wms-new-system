import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetNotifWidget = ({ open }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["notif_widget", { open }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/notif_widget`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    refetchInterval: 60000,
    enabled: open,
  });
  return query;
};
