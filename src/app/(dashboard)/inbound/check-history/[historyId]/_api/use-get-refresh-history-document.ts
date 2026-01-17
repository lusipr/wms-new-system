import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetRefreshHistoryDocument = ({ code_document }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["refresh-history-document", code_document],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/refresh_history_doc/${code_document}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!code_document,
  });
  return query;
};
