import { apiService } from '../api.service';

export interface BaseResource {
  id: string | number;
  [key: string]: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BaseService<T extends BaseResource> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all resources with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return await apiService.get<PaginatedResponse<T>>(url);
  }

  /**
   * Get one resource by ID
   */
  async getOne(id: string | number): Promise<T> {
    return await apiService.get<T>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new resource
   */
  async create(data: Partial<T>): Promise<T> {
    return await apiService.post<Partial<T>, T>(this.endpoint, data);
  }

  /**
   * Update a resource
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    return await apiService.put<Partial<T>, T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Patch a resource (partial update)
   */
  async patch(id: string | number, data: Partial<T>): Promise<T> {
    return await apiService.patch<Partial<T>, T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a resource
   */
  async delete(id: string | number): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Bulk delete resources
   */
  async bulkDelete(ids: (string | number)[]): Promise<void> {
    await apiService.post<{ ids: (string | number)[] }, void>(`${this.endpoint}/bulk-delete`, { ids });
  }
}
