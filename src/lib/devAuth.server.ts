import { cookies } from "next/headers";

export const DEV_AUTH_COOKIE = "oqd_dev_auth";

export async function hasDevAuthServer() {
  const c = await cookies();
  return c.get(DEV_AUTH_COOKIE)?.value === "1";
}
