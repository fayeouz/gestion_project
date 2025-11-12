import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';
import { queryClient } from '@/lib/queryClient';

export const authService = {
  async register(data: { name: string; email: string; password: string; role: string }) {
    const response = await api.post<AuthResponse>('/register', data);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Précharger en arrière-plan SANS attendre
      this.prefetchUserData(response.data.user);
    }
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Précharger IMMÉDIATEMENT en parallèle du login (non-bloquant)
      this.prefetchUserData(response.data.user);
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear();
    }
  },

  async me() {
    const response = await api.get<{ user: User }>('/me');
    return response.data.user;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Précharge TOUTES les données en parallèle de manière agressive
   * N'attend AUCUNE réponse - tout est non-bloquant
   */
  prefetchUserData(user: User) {
    if (!user) return;

    // Import dynamique pour éviter les dépendances circulaires
    const loadServices = async () => {
      const [
        { projectService },
        { taskService },
        { notificationService },
        { dashboardService }
      ] = await Promise.all([
        import('@/services/projectService'),
        import('@/services/taskService'),
        import('@/services/notificationService'),
        import('@/services/dashboardService'),
      ]);

      return { projectService, taskService, notificationService, dashboardService };
    };

    // Tout se fait en arrière-plan sans bloquer
    loadServices().then(({ projectService, taskService, notificationService, dashboardService }) => {
      const prefetchPromises: Promise<any>[] = [];

      // Pour TOUS les rôles
      prefetchPromises.push(
          // Projets (tous + mes projets en parallèle)
          queryClient.prefetchQuery({
            queryKey: ['all-projects'],
            queryFn: () => projectService.getAll(),
            staleTime: 10 * 60 * 1000, // 10 minutes
          }),
          queryClient.prefetchQuery({
            queryKey: ['my-projects'],
            queryFn: () => projectService.getMyProjects(),
            staleTime: 10 * 60 * 1000,
          }),

          // Tâches
          queryClient.prefetchQuery({
            queryKey: ['my-tasks'],
            queryFn: () => taskService.getMyTasks(),
            staleTime: 5 * 60 * 1000,
          }),

          // Notifications
          queryClient.prefetchQuery({
            queryKey: ['my-notifications'],
            queryFn: () => notificationService.getMyNotifications(),
            staleTime: 2 * 60 * 1000,
          })
      );

      // Pour les admins : précharger les données admin
      if (user.role === 'admin') {
        prefetchPromises.push(
            // Users
            queryClient.prefetchQuery({
              queryKey: ['all-users'],
              queryFn: async () => {
                const response = await api.get('/user');
                if (!response.data) return [];
                if (Array.isArray(response.data)) return response.data;
                return response.data.data || [];
              },
              staleTime: 10 * 60 * 1000,
            }),

            // Dashboard stats
            queryClient.prefetchQuery({
              queryKey: ['dashboard-stats'],
              queryFn: () => dashboardService.getStats(),
              staleTime: 5 * 60 * 1000,
            })
        );
      }

      // Exécuter TOUTES les requêtes en parallèle sans attendre
      // Utiliser Promise.allSettled pour ne pas bloquer même si une échoue
      Promise.allSettled(prefetchPromises).catch(() => {
        // Ignorer silencieusement les erreurs de préchargement
        // L'utilisateur verra juste un petit loader plus tard
      });
    }).catch(() => {
      // Ignorer les erreurs d'import
    });
  },
};