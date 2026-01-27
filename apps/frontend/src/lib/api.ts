const API_BASE = import.meta.env.VITE_API_URL ?? ''

export const apiUrl = (path: string) => `${API_BASE}${path}`

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}
