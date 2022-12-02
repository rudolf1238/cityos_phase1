export enum StorageKey {
  ID = 'ID',
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  DEVICES = 'DEVICES',
  LANG = 'LANG',
}

export function removeItem(key: StorageKey): void {
  window.localStorage.removeItem(key);
}

export function getItem(key: StorageKey): unknown | null {
  const value = window.localStorage.getItem(key);
  if (value === null) {
    return value;
  }

  try {
    return JSON.parse(atob(value));
  } catch {
    return null;
  }
}

export function getValue<T>(value: unknown, isType: (value: unknown) => value is T): T | undefined {
  if (isType(value)) return value;
  return undefined;
}

export function setItem(key: StorageKey, value: unknown): void {
  window.localStorage.setItem(key, btoa(JSON.stringify(value)));
}
