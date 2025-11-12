import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { userStoryService } from '@/services/userStoryService';
import { projectService } from '@/services/projectService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateTask() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        user_story_id: '',
        assigned_to: '',
        status: 'pending',
    });

    // Récupérer toutes les user stories
    const { data: userStories, isLoading: isLoadingUserStories } = useQuery({
        queryKey: ['user-stories'],
        queryFn: async () => {
            try {
                return await userStoryService.getAll();
            } catch (error) {
                console.error('Error loading user stories:', error);
                return [];
            }
        },
    });

    // Récupérer les membres du projet de la user story sélectionnée
    const { data: projectMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['user-story-project-members', formData.user_story_id],
        queryFn: async () => {
            try {
                if (!formData.user_story_id) return [];

                // Trouver la user story sélectionnée
                const userStory = userStories?.find((us: any) => us.id === parseInt(formData.user_story_id));
                if (!userStory || !userStory.productBacklog && !userStory.product_backlog) {
                    console.log('User story or backlog not found');
                    return [];
                }

                // Récupérer le project_id depuis le backlog
                const backlog = userStory.productBacklog || userStory.product_backlog;
                const projectId = backlog.project_id;

                if (!projectId) {
                    console.log('Project ID not found');
                    return [];
                }

                // Récupérer les membres du projet
                const members = await projectService.getMembers(projectId);
                return Array.isArray(members) ? members : [];
            } catch (error) {
                console.error('Error loading members:', error);
                return [];
            }
        },
        enabled: !!formData.user_story_id && !!userStories,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const taskData = {
                title: data.title,
                description: data.description,
                user_story_id: parseInt(data.user_story_id),
                assigned_to: parseInt(data.assigned_to),
                status: data.status,
            };

            console.log('Creating task with data:', taskData);
            return await taskService.create(taskData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Tâche créée avec succès !');
            navigate('/tasks');
        },
        onError: (error: any) => {
            console.error('Error creating task:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Échec de la création de la tâche';
            toast.error(errorMessage);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_story_id) {
            toast.error('Veuillez sélectionner une user story');
            return;
        }

        if (!formData.assigned_to) {
            toast.error('Veuillez assigner la tâche à un membre');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Veuillez entrer un titre pour la tâche');
            return;
        }

        createMutation.mutate(formData);
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/tasks')}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux tâches
                    </Button>
                    <h1 className="text-3xl font-bold">Créer une Nouvelle Tâche</h1>
                    <p className="text-muted-foreground">Ajouter une tâche à une user story</p>
                </div>

                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <CardTitle>Détails de la Tâche</CardTitle>
                        <CardDescription>
                            Remplissez les informations pour créer une nouvelle tâche
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Sélection de la User Story */}
                            <div className="space-y-2">
                                <Label htmlFor="user_story">User Story *</Label>
                                {isLoadingUserStories ? (
                                    <div className="flex items-center justify-center p-3 border rounded-md">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Chargement des user stories...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.user_story_id}
                                        onValueChange={(value) => {
                                            setFormData({
                                                ...formData,
                                                user_story_id: value,
                                                assigned_to: '', // Réinitialiser l'assignation
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une user story" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userStories && userStories.length > 0 ? (
                                                userStories.map((story: any) => (
                                                    <SelectItem key={story.id} value={story.id.toString()}>
                                                        {story.title}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="0" disabled>
                                                    Aucune user story disponible
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Titre */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de la Tâche *</Label>
                                <Input
                                    id="title"
                                    placeholder="ex: Implémenter l'authentification"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez la tâche en détail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Assignation */}
                            <div className="space-y-2">
                                <Label htmlFor="assigned_to">Assigner à *</Label>
                                {isLoadingMembers && formData.user_story_id ? (
                                    <div className="flex items-center justify-center p-3 border rounded-md">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Chargement des membres...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.assigned_to}
                                        onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                                        disabled={!formData.user_story_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !formData.user_story_id
                                                    ? "Sélectionner d'abord une user story"
                                                    : "Sélectionner un membre"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectMembers && projectMembers.length > 0 ? (
                                                projectMembers.map((member: any) => (
                                                    <SelectItem key={member.id} value={member.id.toString()}>
                                                        {member.name} {member.role ? `(${member.role})` : ''}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="0" disabled>
                                                    Aucun membre disponible
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Statut */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Statut</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="active">En cours</SelectItem>
                                        <SelectItem value="completed">Terminée</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Note d'information */}
                            <div className="bg-muted/20 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Note :</strong> La tâche sera créée et assignée au membre sélectionné. Vous pouvez modifier l'assignation et le statut ultérieurement.
                                </p>
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('sm/tasks')}
                                    disabled={createMutation.isPending}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-primary hover:opacity-90"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        'Créer la Tâche'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}