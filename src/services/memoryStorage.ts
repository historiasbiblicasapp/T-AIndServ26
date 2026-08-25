const store = new Map<string, string>()

export function getItem(key: string): string | null {
  return store.has(key) ? store.get(key)! : null
}

export function setItem(key: string, value: string): void {
  store.set(key, value)
}

export function removeItem(key: string): void {
  store.delete(key)
}

export function keys(): string[] {
  return Array.from(store.keys())
}

export function clear(): void {
  store.clear()
}
