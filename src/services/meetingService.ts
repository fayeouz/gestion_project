import { api } from '@/lib/api';
import { Meeting, CreateMeetingData, MeetingStats } from '@/types';

export const meetingService = {
    /**
     * Récupérer tous les meetings
     */
    async getAll(): Promise<Meeting[]> {
        try {
            const response = await api.get('/meeting');

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
            console.error('Error fetching meetings:', error);
            return [];
        }
    },

    /**
     * Récupérer un meeting par ID
     */
    async getById(id: number): Promise<Meeting | null> {
        try {
            const response = await api.get(`/meeting/${id}`);

            if (!response.data) {
                return null;
            }

            // Si c'est wrappé dans { data: {...} }
            if (response.data.data) {
                return response.data.data;
            }

            // Si c'est direct
            return response.data;
        } catch (error) {
            console.error('Error fetching meeting:', error);
            return null;
        }
    },

    /**
     * Créer un nouveau meeting
     * Envoie automatiquement des notifications à tous les membres du projet
     */
    async create(data: CreateMeetingData): Promise<Meeting> {
        try {
            const response = await api.post('/meeting', data);

            if (!response.data) {
                throw new Error('Failed to create meeting');
            }

            // Si c'est wrappé dans { data: {...} }
            if (response.data.data) {
                return response.data.data;
            }

            // Si c'est direct
            return response.data;
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un meeting
     */
    async update(id: number, data: Partial<CreateMeetingData>): Promise<Meeting> {
        try {
            const response = await api.put(`/meeting/${id}`, data);

            if (!response.data) {
                throw new Error('Failed to update meeting');
            }

            // Si c'est wrappé dans { data: {...} }
            if (response.data.data) {
                return response.data.data;
            }

            // Si c'est direct
            return response.data;
        } catch (error) {
            console.error('Error updating meeting:', error);
            throw error;
        }
    },

    /**
     * Supprimer un meeting
     */
    async delete(id: number): Promise<void> {
        try {
            await api.delete(`/meeting/${id}`);
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    },

    /**
     * Récupérer tous les meetings d'un projet
     */
    async getMeetingsByProject(projectId: number): Promise<Meeting[]> {
        try {
            const response = await api.get(`/meetings/project/${projectId}`);

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
            console.error('Error fetching project meetings:', error);
            return [];
        }
    },

    /**
     * Récupérer tous les meetings organisés par un utilisateur
     */
    async getMeetingsByUser(userId: number): Promise<Meeting[]> {
        try {
            const response = await api.get(`/meetings/user/${userId}`);

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
            console.error('Error fetching user meetings:', error);
            return [];
        }
    },

    /**
     * Récupérer les meetings de l'utilisateur authentifié
     * (tous les meetings de ses projets)
     */
    async getMyMeetings(): Promise<Meeting[]> {
        try {
            const response = await api.get('/my-meetings');

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
            console.error('Error fetching my meetings:', error);
            return [];
        }
    },

    /**
     * Récupérer les statistiques des meetings pour un projet
     */
    async getProjectMeetingStats(projectId: number): Promise<MeetingStats> {
        try {
            const response = await api.get(`/meetings/stats/${projectId}`);

            if (!response.data) {
                return this.getEmptyStats();
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching meeting stats:', error);
            return this.getEmptyStats();
        }
    },

    /**
     * Retourne des statistiques vides par défaut
     */
    getEmptyStats(): MeetingStats {
        return {
            total_meetings: 0,
            by_type: {
                daily_standup: 0,
                sprint_planning: 0,
                sprint_review: 0,
                sprint_retrospective: 0,
                backlog_refinement: 0,
            },
            total_duration: 0,
            average_duration: 0,
        };
    },
};