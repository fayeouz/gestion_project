import { api } from '@/lib/api';
import { UserStory } from '@/types';

export const userStoryService = {
  async getAll() {
    const response = await api.get<{ data: UserStory[] } | UserStory[]>('/userStory');
    // Gérer les deux formats de réponse
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  async getByBacklog(backlogId: number) {
    const response = await api.get<{ data: UserStory[] } | UserStory[]>(`/backlogs/${backlogId}/user-stories`);
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  // Nouvelle méthode pour récupérer les user stories du PO par projet
  async getMyProjectUserStories(projectId: number) {
    const response = await api.get<UserStory[]>(`/projects/${projectId}/my-user-stories`);
    return Array.isArray(response.data) ? response.data : (response.data || []);
  },

  async getById(id: number) {
    const response = await api.get<{ data: UserStory } | UserStory>(`/userStory/${id}`);

    // Si la réponse contient directement l'objet UserStory
    if (response.data && 'id' in response.data && 'title' in response.data) {
      return response.data as UserStory;
    }

    // Si la réponse est encapsulée dans { data: ... }
    const data = (response.data as { data: UserStory }).data;
    if (!data) {
      throw new Error('User story not found');
    }
    return data;
  },

  async create(data: Partial<UserStory>) {
    const response = await api.post<{ data: UserStory } | UserStory>('/userStory', data);

    if (response.data && 'id' in response.data) {
      return response.data as UserStory;
    }

    const result = (response.data as { data: UserStory }).data;
    if (!result) {
      throw new Error('Failed to create user story');
    }
    return result;
  },

  async update(id: number, data: Partial<UserStory>) {
    const response = await api.put<{ data: UserStory } | UserStory>(`/userStory/${id}`, data);

    if (response.data && 'id' in response.data) {
      return response.data as UserStory;
    }

    const result = (response.data as { data: UserStory }).data;
    if (!result) {
      throw new Error('Failed to update user story');
    }
    return result;
  },

  async delete(id: number) {
    await api.delete(`/userStory/${id}`);
  },
};