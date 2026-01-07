import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetScanManifestInbound = ({ code, p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["scan-manifest-inbound", code, { p, q }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/documents/${code}/user_scan_webs`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
