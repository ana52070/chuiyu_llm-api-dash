const STORAGE_KEY = 'llm-dashboard-keys';

export function getAllKeys(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getKey(providerId: string): string {
  return getAllKeys()[providerId] || '';
}

export function setKey(providerId: string, key: string): void {
  const keys = getAllKeys();
  if (key) {
    keys[providerId] = key;
  } else {
    delete keys[providerId];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function removeKey(providerId: string): void {
  setKey(providerId, '');
}

const OC_COOKIE_KEY = 'llm-dashboard-oc-cookie';
const OC_SERVER_ID_KEY = 'llm-dashboard-oc-sid';

function safeGet(key: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(key) || '';
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}

export function getOpencodeCookie(): string {
  return safeGet(OC_COOKIE_KEY);
}

export function setOpencodeCookie(value: string): void {
  safeSet(OC_COOKIE_KEY, value);
}

export function getOpencodeServerId(): string {
  return safeGet(OC_SERVER_ID_KEY);
}

export function setOpencodeServerId(value: string): void {
  safeSet(OC_SERVER_ID_KEY, value);
}
