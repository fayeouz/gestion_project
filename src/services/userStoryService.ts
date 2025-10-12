import { api } from '@/lib/api';
import { UserStory } from '@/types';

export const userStoryService = {
  async getAll() {
    const response = await api.get<{ data: UserStory[] }>('/userStory');
    return response.data.data;
  },

  async getByBacklog(backlogId: number) {
    const response = await api.get<{ data: UserStory[] }>(`/backlogs/${backlogId}/user-stories`);
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get<{ data: UserStory }>(`/userStory/${id}`);
    return response.data.data;
  },

  async create(data: Partial<UserStory>) {
    const response = await api.post<{ data: UserStory }>('/userStory', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<UserStory>) {
    const response = await api.put<{ data: UserStory }>(`/userStory/${id}`, data);
    return response.data.data;
  },

  async delete(id: number) {
    await api.delete(`/userStory/${id}`);
  },
};
