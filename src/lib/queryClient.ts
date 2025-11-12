import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache les données pendant 5 minutes
            staleTime: 5 * 60 * 1000,

            // Garde les données en cache pendant 10 minutes
            cacheTime: 10 * 60 * 1000,

            // Ne pas refetch automatiquement au focus de la fenêtre
            refetchOnWindowFocus: false,

            // Ne pas refetch au remount si les données sont fraîches
            refetchOnMount: false,

            // Retry une seule fois en cas d'erreur
            retry: 1,

            // Délai entre les retries (1 seconde)
            retryDelay: 1000,

            // Afficher les anciennes données pendant le chargement
            keepPreviousData: true,
        },
        mutations: {
            // Retry les mutations une fois en cas d'erreur réseau
            retry: 1,
        },
    },
});

// Fonction helper pour précharger plusieurs requêtes en parallèle
export const prefetchDashboardData = async () => {
    const prefetchPromises = [
        // Précharger les projets
        queryClient.prefetchQuery({
            queryKey: ['all-projects'],
            queryFn: async () => {
                const { projectService } = await import('@/services/projectService');
                return projectService.getAll();
            },
        }),

        // Précharger les users
        queryClient.prefetchQuery({
            queryKey: ['all-users'],
            queryFn: async () => {
                const { api } = await import('@/lib/api');
                const response = await api.get('/user');
                if (!response.data) return [];
                if (Array.isArray(response.data)) return response.data;
                return response.data.data || [];
            },
        }),
    ];

    // Attendre que toutes les requêtes soient terminées
    await Promise.allSettled(prefetchPromises);
};