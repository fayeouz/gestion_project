import { api } from '@/lib/api';
import { Task, TaskStats } from '@/types';

export const taskService = {
  async getAll() {
    const response = await api.get<{ data: Task[] }>('/task');
    return response.data.data;
  },

  async getMyTasks() {
    const response = await api.get<{ data: { tasks: Task[]; stats: TaskStats } }>('/my-tasks');
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get<{ data: Task }>(`/task/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Task>) {
    const response = await api.post<{ data: Task }>('/task', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Task>) {
    const response = await api.put<{ data: Task }>(`/task/${id}`, data);
    return response.data.data;
  },

  async delete(id: number) {
    await api.delete(`/task/${id}`);
  },

  async updateStatus(id: number, status: string) {
    return this.update(id, { status: status as any });
  },
};
