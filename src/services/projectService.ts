import { api } from '@/lib/api';
import { Project } from '@/types';

export const projectService = {
  async getAll() {
    const response = await api.get<{ data: Project[] }>('/project');
    return response.data.data;
  },

  async getMyProjects() {
    const response = await api.get<{ data: Project[] }>('/my-project');
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get<{ data: Project }>(`/project/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Project>) {
    const response = await api.post<{ data: Project }>('/project', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Project>) {
    const response = await api.put<{ data: Project }>(`/project/${id}`, data);
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
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data.data;
  },
};
