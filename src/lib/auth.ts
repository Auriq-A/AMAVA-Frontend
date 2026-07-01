// Minimal account/session helper. Stores the API key from login/register and
// attaches it as X-API-Key to BOTH axios (default header) and window.fetch
// (global wrapper) so every existing page call is authenticated without edits.
import axios from 'axios';

export const API_BASE = 'https://api-amava.up.railway.app';
const KEY = 'amava_api_key';
const EMAIL = 'amava_email';

export const getApiKey = () => localStorage.getItem(KEY);
export const getEmail = () => localStorage.getItem(EMAIL);

export function setAuth(apiKey: string, email: string) {
  localStorage.setItem(KEY, apiKey);
  localStorage.setItem(EMAIL, email);
  applyAxios();
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(EMAIL);
  applyAxios();
}

function applyAxios() {
  const k = getApiKey();
  if (k) axios.defaults.headers.common['X-API-Key'] = k;
  else delete axios.defaults.headers.common['X-API-Key'];
}

let patched = false;
// Call once at startup. Wraps fetch so API_BASE requests carry the key.
export function installAuth() {
  applyAxios();
  if (patched) return;
  patched = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    try {
      const url = typeof input === 'string' ? input : (input as Request)?.url || String(input);
      const k = getApiKey();
      if (k && url.indexOf(API_BASE) !== -1) {
        init = { ...init, headers: { ...(init.headers || {}), 'X-API-Key': k } };
      }
    } catch { /* ignore */ }
    return orig(input as any, init);
  };
}
