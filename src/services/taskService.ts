import { api } from '@/lib/api';
import { Task, TaskStats } from '@/types';

export const taskService = {
  async getAll() {
    try {
      const response = await api.get('/task');

      // Gérer différents formats de réponse
      if (!response.data) {
        return [];
      }

      // Si c'est un tableau direct
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Si c'est wrappé dans { data: [...] }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback sur tableau vide
      return [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async getMyTasks() {
    try {
      const response = await api.get('/my-tasks');
      console.log('Raw API response:', response.data); // Debug

      if (!response.data) {
        return { tasks: [], stats: { total: 0, pending: 0, active: 0, completed: 0 } };
      }

      let tasks = [];
      let stats = { total: 0, pending: 0, active: 0, completed: 0 };

      // Si c'est wrappé dans { data: { tasks, stats } }
      if (response.data.data) {
        tasks = response.data.data.tasks || [];
        stats = response.data.data.stats || stats;
      }
      // Si c'est direct { tasks, stats }
      else if (response.data.tasks) {
        tasks = response.data.tasks;
        stats = response.data.stats || stats;
      }
      // Si c'est juste un tableau de tâches
      else if (Array.isArray(response.data)) {
        tasks = response.data;
        stats = this.calculateStats(tasks);
      }
      // Si la réponse est mal formatée, essayer de l'adapter
      else {
        tasks = response.data.tasks || [];
        stats = response.data.stats || this.calculateStats(tasks);
      }

      // S'assurer que les stats sont cohérentes
      if (!stats.total) {
        stats.total = tasks.length;
      }
      if (!stats.pending) {
        stats.pending = tasks.filter(task => task.status === 'pending').length;
      }
      if (!stats.active) {
        stats.active = tasks.filter(task => task.status === 'active').length;
      }
      if (!stats.completed) {
        stats.completed = tasks.filter(task => task.status === 'completed').length;
      }

      console.log('Processed tasks:', tasks); // Debug
      console.log('Processed stats:', stats); // Debug

      return { tasks, stats };
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      return { tasks: [], stats: { total: 0, pending: 0, active: 0, completed: 0 } };
    }
  },

  // Méthode pour calculer les stats si l'API ne les fournit pas
  calculateStats(tasks: Task[]): TaskStats {
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      active: tasks.filter(task => task.status === 'active').length,
      completed: tasks.filter(task => task.status === 'completed').length,
    };
  },

  async getById(id: number) {
    try {
      const response = await api.get(`/task/${id}`);

      if (!response.data) {
        throw new Error('Task not found');
      }

      // Si c'est wrappé dans { data: {...} }
      if (response.data.data) {
        return response.data.data;
      }

      // Si c'est direct
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  async create(data: Partial<Task>) {
    try {
      const response = await api.post('/task', data);

      if (!response.data) {
        throw new Error('Failed to create task');
      }

      // Si c'est wrappé dans { data: {...} }
      if (response.data.data) {
        return response.data.data;
      }

      // Si c'est direct
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async update(id: number, data: Partial<Task>) {
    try {
      const response = await api.put(`/task/${id}`, data);

      if (!response.data) {
        throw new Error('Failed to update task');
      }

      // Si c'est wrappé dans { data: {...} }
      if (response.data.data) {
        return response.data.data;
      }

      // Si c'est direct
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      await api.delete(`/task/${id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async updateStatus(id: number, status: string) {
    try {
      const response = await api.patch(`/task/${id}/status`, { status });

      if (!response.data) {
        throw new Error('Failed to update task status');
      }

      // Si c'est wrappé dans { data: {...} }
      if (response.data.data) {
        return response.data.data;
      }

      // Si c'est direct
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
};