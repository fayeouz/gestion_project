import { api } from '@/lib/api';
import { Project } from '@/types';

export interface Message {
    id: number;
    content: string;
    chat_project_id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface ChatProject {
    id: number;
    project_id: number;
    project?: Project;
    created_at: string;
    updated_at: string;
}

export interface SendMessageData {
    content: string;
    chat_project_id: number;
    user_id: number;
}

class ChatService {
    // Récupérer tous les messages
    async getAllMessages(): Promise<Message[]> {
        try {
            const response = await api.get('/message');

            if (!response.data) return [];
            if (Array.isArray(response.data)) return response.data;
            if (response.data.data && Array.isArray(response.data.data)) return response.data.data;

            return [];
        } catch (error) {
            console.error('Error fetching all messages:', error);
            return [];
        }
    }

    // Récupérer les messages d'un chat project
    async getMessagesByChatProject(chatProjectId: number): Promise<Message[]> {
        try {
            const response = await api.get(`/message-by-chat`, {
                params: { chat_project_id: chatProjectId }
            });

            if (!response.data) return [];
            if (Array.isArray(response.data)) return response.data;
            if (response.data.data && Array.isArray(response.data.data)) return response.data.data;

            return [];
        } catch (error: any) {
            console.error('Error loading messages:', error);
            if (error.response?.status === 404) {
                return [];
            }
            return [];
        }
    }

    // Envoyer un message
    async sendMessage(data: SendMessageData): Promise<Message> {
        const response = await api.post('/message', data);

        if (response.data) {
            if (response.data.data) return response.data.data;
            return response.data;
        }

        throw new Error('Invalid response format');
    }

    // Récupérer un message spécifique
    async getMessage(id: number): Promise<Message> {
        const response = await api.get(`/message/${id}`);

        if (response.data) {
            if (response.data.data) return response.data.data;
            return response.data;
        }

        throw new Error('Message not found');
    }

    // Mettre à jour un message
    async updateMessage(id: number, content: string): Promise<Message> {
        const response = await api.put(`/message/${id}`, { content });

        if (response.data) {
            if (response.data.data) return response.data.data;
            return response.data;
        }

        throw new Error('Invalid response format');
    }

    // Supprimer un message
    async deleteMessage(id: number): Promise<void> {
        await api.delete(`/message/${id}`);
    }
}

export default new ChatService();