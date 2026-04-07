import http from "@/lib/http";

export interface RoleDTO {
  id?: number;
  name: string;
  slug?: string;
}

export interface PermissionDTO {
  id?: number;
  name: string;
  slug?: string;
}

export async function listRoles(): Promise<RoleDTO[]> {
  try {
    const res = await http.get<any>('/roles');
    // API may return either an array or an object with `data` field.
    const data = Array.isArray(res) ? res : res?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function listPermissions(): Promise<PermissionDTO[]> {
  try {
    const res = await http.get<any>('/permissions');
    const data = Array.isArray(res) ? res : res?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
