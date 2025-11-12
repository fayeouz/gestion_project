import { api } from '@/lib/api';
import { Project } from '@/types';

export const projectService = {
  async getAll() {
    const response = await api.get<Project[] | { data: Project[] }>('/project');

    if (!response.data) {
      return [];
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },

  async getMyProjects() {
    const response = await api.get<Project[] | { data: Project[] }>('/my-project');

    if (!response.data) {
      return [];
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },

  async getById(id: number) {
    try {
      const response = await api.get(`/project/${id}`);

      console.log('Project response:', response.data); // Debug

      if (!response.data) {
        throw new Error('Project not found');
      }

      // L'API retourne directement le projet (pas de wrapper)
      return response.data as Project;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 404) {
        throw new Error('Project not found');
      }
      throw error;
    }
  },

  async create(data: Partial<Project>) {
    const response = await api.post<{ data: Project }>('/project', data);
    if (!response.data || !response.data.data) {
      throw new Error('Failed to create project');
    }
    return response.data.data;
  },

  async update(id: number, data: Partial<Project>) {
    const response = await api.put<{ data: Project }>(`/project/${id}`, data);
    if (!response.data || !response.data.data) {
      throw new Error('Failed to update project');
    }
    return response.data.data;
  },

  async delete(id: number) {
    await api.delete(`/project/${id}`);
  },

  async addUsers(projectId: number, userIds: number[]) {
    const response = await api.post(`/projects/${projectId}/users`, { user_ids: userIds });
    return response.data;
  },

  async removeUsers(projectId: number, userIds: number[]) {
    await api.delete(`/projects/${projectId}/users`, { data: { user_ids: userIds } });
  },

  async getMembers(projectId: number) {
    const response = await api.get<any[] | { data: any[] }>(`/projects/${projectId}/members`);

    if (!response.data) {
      return [];
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data || [];
  },

  async getProjectBacklogWithStats(projectId: number) {
    try {
      const response = await api.get(`/projects/${projectId}/backlog-stats`);

      if (!response.data) {
        return {
          project: null,
          userStories: [],
          stats: {
            total: 0,
            in_backlog: 0,
            in_sprint: 0,
            completed: 0,
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching project backlog stats:', error);
      return {
        project: null,
        userStories: [],
        stats: {
          total: 0,
          in_backlog: 0,
          in_sprint: 0,
          completed: 0,
        }
      };
    }
  },
};