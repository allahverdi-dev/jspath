/**
 * Local persistence.
 *
 * Guest learners are first-class here: everything they do is written to
 * localStorage under a versioned key, and the app remains fully usable with no
 * account and no network. Every access is defensive — Safari private mode, a
 * disabled-storage policy or a full quota must degrade to in-memory state rather
 * than crashing the app.
 */

const PREFIX = 'jspath';
export const STORAGE_KEYS = {
  userState: `${PREFIX}.userState`,
  theme: `${PREFIX}.theme`,
  playground: `${PREFIX}.playground`,
  snippets: `${PREFIX}.snippets`,
  session: `${PREFIX}.session`,
};

/** In-memory fallback so the app still works when storage is unavailable. */
const memory = new Map();
let storageAvailable = null;

function available() {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const probe = `${PREFIX}.__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

export function isPersistent() {
  return available();
}

export function readRaw(key) {
  if (!available()) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export function writeRaw(key, value) {
  memory.set(key, value);
  if (!available()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // QuotaExceededError — keep working from memory rather than losing the session.
    if (import.meta.env?.DEV) console.warn(`[jspath] could not persist ${key}:`, e.message);
    return false;
  }
}

export function readJson(key, fallback = null) {
  const raw = readRaw(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    // Corrupted entry: keep a copy for diagnosis rather than silently destroying data.
    try {
      writeRaw(`${key}.corrupt.${Date.now()}`, raw);
      remove(key);
    } catch { /* nothing more we can do */ }
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function remove(key) {
  memory.delete(key);
  if (!available()) return;
  try {
    window.localStorage.removeItem(key);
  } catch { /* ignore */ }
}

/** Remove every JSPath key. Used by "reset all progress" in Settings. */
export function clearAll() {
  memory.clear();
  if (!available()) return;
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/** Approximate bytes used by JSPath keys — surfaced in Settings. */
export function usageBytes() {
  if (!available()) return 0;
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(PREFIX)) total += k.length + (window.localStorage.getItem(k)?.length ?? 0);
    }
  } catch { /* ignore */ }
  return total * 2; // UTF-16 code units
}
