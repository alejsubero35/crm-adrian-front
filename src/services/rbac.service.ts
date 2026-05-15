import http from '@/lib/http';

export type RoleItem = {
  id: number;
  name: string;
  permissions: string[];
};

export type PermissionItem = {
  id: number;
  name: string;
  category: string;
};

type RolesPermissionsResponse = {
  roles: RoleItem[];
  permissions_by_category: Record<string, PermissionItem[]>;
};

export const rbacService = {
  async getRolesPermissions() {
    return http.get<RolesPermissionsResponse>('/roles-permissions');
  },

  async syncRolePermissions(roleId: number, permissions: string[]) {
    return http.put<{ message: string; permissions: string[] }>(`/roles/${roleId}/permissions`, {
      permissions,
    });
  },

  async getUsers() {
    return http.get<{
      data: Array<{
        id: number;
        email: string;
        first_name?: string;
        last_name?: string;
        roles: string[];
        customer_id?: number | null;
        customer_name?: string | null;
      }>;
    }>('/users');
  },

  async createUser(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    status?: string;
    customer_id?: number | null;
  }) {
    return http.post<{ message: string; data: { id: number; email: string; first_name?: string; last_name?: string; roles: string[] } }>(
      '/users',
      payload
    );
  },

  async updateUser(
    userId: number,
    payload: {
      name: string;
      email: string;
      password?: string;
      role: string;
      status?: string;
      customer_id?: number | null;
    }
  ) {
    return http.put<{ message: string; data: { id: number; email: string; first_name?: string; last_name?: string; roles: string[] } }>(
      `/users/${userId}`,
      payload
    );
  },

  async deleteUser(userId: number) {
    return http.delete<{ message: string }>(`/users/${userId}`);
  },

  async updateUserRole(userId: number, role: string) {
    return http.put<{ message: string; roles: string[] }>(`/users/${userId}/role`, { role });
  },
};

