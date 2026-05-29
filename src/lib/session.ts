const KEY = "ambientos_session_id";
const API_KEY_STORAGE = "ambientos_gemini_key";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

export function getUserApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}
export function setUserApiKey(v: string) {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(API_KEY_STORAGE, v);
  else localStorage.removeItem(API_KEY_STORAGE);
}
