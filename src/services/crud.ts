import http from '@/lib/http'

// Normaliza respuestas de listado típicas de Laravel / APIs
// Soporta formatos: [] | {data: []} | {data: {data: []}} (paginación Laravel) | {resourceName: []} | {data: {resourceName: []}} | {resourceName: {data: []}}
export function normalizeListResponse<T>(data: any, resourceName?: string): T[] {
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data?.data)) return data.data as T[]
  // Laravel paginated response: { data: { data: [...], current_page, ... } }
  if (Array.isArray(data?.data?.data)) return data.data.data as T[]

  if (resourceName) {
    if (Array.isArray((data as any)[resourceName])) return (data as any)[resourceName] as T[]
    if (Array.isArray((data as any)?.data?.[resourceName])) return (data as any).data[resourceName] as T[]
    if (Array.isArray((data as any)?.[resourceName]?.data)) return (data as any)[resourceName].data as T[]
  }

  return []
}

// GET genérico para colecciones
export async function fetchCollection<T>(path: string, resourceName?: string): Promise<T[]> {
  const data = await http.get<any>(path)
  return normalizeListResponse<T>(data, resourceName)
}

// GET genérico para búsquedas de colecciones (mismo tratamiento que fetchCollection)
export async function searchCollection<T>(path: string, resourceName?: string): Promise<T[]> {
  const data = await http.get<any>(path)
  return normalizeListResponse<T>(data, resourceName)
}

// POST genérico que devuelve el recurso creado. Intenta mapear { data: {resource} } o { resource } o el body completo.
export async function createResource<T, P>(path: string, payload: P, resourceKey?: string): Promise<T> {
  const res = await http.post<any>(path, payload)
  const candidate =
    (resourceKey && res?.data?.[resourceKey]) ||
    (resourceKey && res?.[resourceKey]) ||
    res?.data ||
    res
  return candidate as T
}

// PUT/PATCH genérico que devuelve el recurso actualizado
export async function updateResource<T, P>(path: string, payload: P, resourceKey?: string): Promise<T> {
  const res = await http.put<any>(path, payload)
  const candidate =
    (resourceKey && res?.data?.[resourceKey]) ||
    (resourceKey && res?.[resourceKey]) ||
    res?.data ||
    res
  return candidate as T
}

// DELETE genérico
export async function deleteResource(path: string): Promise<void> {
  await http.delete(path)
}

