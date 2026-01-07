import "server-only";

import { baseUrl } from "./baseUrl";
import { deleteCookie, hasCookie } from "cookies-next";
import { cookies } from "next/headers";

export const protect = async () => {
  const cookie = await cookies();
  const token = cookie.get("accessToken")?.value;
  try {
    const res = await fetch(`${baseUrl}/checkLogin`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if ((await hasCookie("profile")) || (await hasCookie("accessToken"))) {
        await deleteCookie("profile");
        await deleteCookie("accessToken");
      }
      return false;
    }

    return true;
  } catch (error) {
    console.log("ERROR_CHECK", error);
    return false;
  }
};
