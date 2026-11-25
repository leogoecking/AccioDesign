import { normalizeThemeDocument, type AccioThemeDocument } from "./schema";

const SAVED_THEMES_STORAGE_KEY = "acciodesign:tweakcn:saved-themes:v1";

export function loadSavedThemes(): AccioThemeDocument[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SAVED_THEMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => normalizeThemeDocument(entry));
  } catch {
    return [];
  }
}

export function saveThemeSnapshot(
  theme: AccioThemeDocument
): AccioThemeDocument[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const normalized = normalizeThemeDocument({
    ...theme,
    updatedAt: new Date().toISOString(),
  });

  const existing = loadSavedThemes().filter((item) => item.id !== normalized.id);
  const next = [normalized, ...existing].slice(0, 30);

  try {
    window.localStorage.setItem(SAVED_THEMES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors cleanly
  }

  return next;
}

export function deleteSavedTheme(id: string): AccioThemeDocument[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const next = loadSavedThemes().filter((item) => item.id !== id);
  try {
    window.localStorage.setItem(SAVED_THEMES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors cleanly
  }

  return next;
}
