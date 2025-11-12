import { api } from '@/lib/api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export const userService = {
    /**
     * Récupérer tous les utilisateurs
     */
    async getAll(): Promise<User[]> {
        try {
            const response = await api.get('/users');

            console.log('Users API response:', response.data);

            if (!response.data) {
                return [];
            }

            // L'API Laravel retourne directement un tableau
            if (Array.isArray(response.data)) {
                return response.data;
            }

            // Si l'API retourne { data: [...] }
            if (response.data.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    /**
     * Récupérer les utilisateurs disponibles (sans projet et non PM)
     */
    async getAvailableUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users/available');

            console.log('Available users API response:', response.data);

            if (!response.data) {
                return [];
            }

            if (Array.isArray(response.data)) {
                return response.data;
            }

            if (response.data.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('Error fetching available users:', error);
            return [];
        }
    },

    /**
     * Récupérer les utilisateurs disponibles pour un projet spécifique
     */
    async getAvailableUsersForProject(projectId: number): Promise<User[]> {
        try {
            const response = await api.get(`/users/available-for-project/${projectId}`);

            console.log('Available users for project API response:', response.data);

            if (!response.data) {
                return [];
            }

            if (Array.isArray(response.data)) {
                return response.data;
            }

            if (response.data.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('Error fetching available users for project:', error);
            return [];
        }
    },

    /**
     * Récupérer un utilisateur par ID
     */
    async getById(id: number): Promise<User | null> {
        try {
            const response = await api.get(`/users/${id}`);

            if (!response.data) {
                return null;
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },

    /**
     * Mettre à jour un utilisateur
     */
    async update(id: number, data: Partial<User>): Promise<User> {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Supprimer un utilisateur
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};