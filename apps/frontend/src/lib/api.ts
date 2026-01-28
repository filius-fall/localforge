const API_BASE = import.meta.env.VITE_API_URL ?? ''

export const apiUrl = (path: string) => `${API_BASE}${path}`

export async function getJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), options)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}
