export const DEV_AUTH_COOKIE = "oqd_dev_auth";
const DEV_AUTH_STORAGE_KEY = "oqd_dev_auth_payload";

type DevAuthPayload = {
  email: string;
  loginAt: string;
};

export function setDevAuthClient(email: string) {
  if (typeof window === "undefined") return;
  const payload: DevAuthPayload = {
    email: email.trim() || "dev-user@local",
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem(DEV_AUTH_STORAGE_KEY, JSON.stringify(payload));
  document.cookie = `${DEV_AUTH_COOKIE}=1; path=/; max-age=604800; samesite=lax`;
}

export function clearDevAuthClient() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
  document.cookie = `${DEV_AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
