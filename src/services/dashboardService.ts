import { api } from '@/lib/api';

export interface DashboardStats {
    projects: {
        total: number;
        active: number;
        pending: number;
        completed: number;
        recent: any[];
    };
    users: {
        total: number;
        roleDistribution: Record<string, number>;
    };
    tasks?: {
        total: number;
        pending: number;
        active: number;
        completed: number;
    };
}

export const dashboardService = {
    /**
     * Récupère toutes les statistiques du dashboard en une seule requête
     * Si votre backend ne supporte pas cette route, cette fonction fait
     * les requêtes en parallèle pour optimiser les performances
     */
    async getStats(): Promise<DashboardStats> {
        try {
            // Option 1: Si votre backend a une route /dashboard/stats
            const response = await api.get<{ data: DashboardStats }>('/dashboard/stats');
            return response.data.data;
        } catch (error) {
            // Option 2: Fallback - Requêtes parallèles si la route n'existe pas
            return this.getStatsParallel();
        }
    },

    /**
     * Récupère les stats en faisant plusieurs requêtes en parallèle
     */
    async getStatsParallel(): Promise<DashboardStats> {
        const [projectsRes, usersRes] = await Promise.all([
            api.get('/project'),
            api.get('/user'),
        ]);

        // Normaliser les réponses
        const projects = Array.isArray(projectsRes.data)
            ? projectsRes.data
            : projectsRes.data?.data || [];

        const users = Array.isArray(usersRes.data)
            ? usersRes.data
            : usersRes.data?.data || [];

        // Calculer les statistiques côté client
        const projectStats = {
            total: projects.length,
            active: projects.filter((p: any) => p.status === 'active').length,
            pending: projects.filter((p: any) => p.status === 'pending').length,
            completed: projects.filter((p: any) => p.status === 'completed').length,
            recent: projects.slice(0, 5),
        };

        const roleDistribution = users.reduce((acc: Record<string, number>, user: any) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        return {
            projects: projectStats,
            users: {
                total: users.length,
                roleDistribution,
            },
        };
    },
};