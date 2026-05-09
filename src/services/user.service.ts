import { apiService } from './api.service';

export interface UserContextResponse {
  // Define the structure as needed
  id: number;
  email: string;
  // Add other fields
}

export const userService = {
  async getContext(): Promise<UserContextResponse> {
    return await apiService.get<UserContextResponse>('/me');
  },
};