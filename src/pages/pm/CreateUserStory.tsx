import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { projectService } from '@/services/projectService';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function CreateUserStory() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: '',
        sprint_id: '',
        status: 'pending',
    });

    // Charger les projets du PM
    const { data: projects } = useQuery({
        queryKey: ['pm-projects'],
        queryFn: () => projectService.getMyProjects(),
    });

    // Charger les sprints du projet sélectionné
    const { data: sprints } = useQuery({
        queryKey: ['project-sprints', formData.project_id],
        queryFn: async () => {
            if (!formData.project_id) return [];
            const response = await api.get(`/projects/${formData.project_id}/sprints`);
            return response.data.data || response.data;
        },
        enabled: !!formData.project_id,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // D'abord, récupérer le product_backlog_id du projet
            const projectResponse = await api.get(`/project/${data.project_id}`);
            const project = projectResponse.data;

            if (!project.productBacklog && !project.product_backlog) {
                throw new Error('Product backlog non trouvé pour ce projet');
            }

            const userStoryData = {
                title: data.title,
                description: data.description,
                product_backlog_id: project.productBacklog?.id || project.product_backlog?.id,
                sprint_id: data.sprint_id ? Number(data.sprint_id) : null,
                status: data.status,
            };

            const response = await api.post('/userStory', userStoryData);
            return response.data.data || response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-user-stories'] });
            queryClient.invalidateQueries({ queryKey: ['project-user-stories'] });
            toast.success('User Story créée avec succès !');
            navigate('/po/user-stories');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Échec de la création de la user story');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.project_id) {
            toast.error('Veuillez sélectionner un projet');
            return;
        }

        createMutation.mutate(formData);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'active': return 'Actif';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/po/user-stories')}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux User Stories
                    </Button>
                    <h1 className="text-3xl font-bold">Créer une nouvelle User Story</h1>
                    <p className="text-muted-foreground">Ajoutez une nouvelle user story à votre backlog produit</p>
                </div>

                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <CardTitle>Détails de la User Story</CardTitle>
                        <CardDescription>
                            Remplissez les informations ci-dessous pour créer une nouvelle user story
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Project Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="project_id">Projet *</Label>
                                <Select
                                    value={formData.project_id}
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData,
                                            project_id: value,
                                            sprint_id: '' // Réinitialiser le sprint quand le projet change
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un projet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects?.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Sélectionnez le projet auquel cette user story appartient
                                </p>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre *</Label>
                                <Input
                                    id="title"
                                    placeholder="En tant qu'utilisateur, je souhaite..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Utilisez le format : "En tant que [type d'utilisateur], je souhaite [objectif] afin de [bénéfice]"
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez la user story en détail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Incluez les critères d'acceptation, notes techniques ou toute autre information pertinente
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner le statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">En attente</SelectItem>
                                            <SelectItem value="active">Actif</SelectItem>
                                            <SelectItem value="completed">Terminé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sprint Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="sprint_id">Sprint (Optionnel)</Label>
                                    <Select
                                        value={formData.sprint_id || "none"}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            sprint_id: value === "none" ? "" : value
                                        })}
                                        disabled={!formData.project_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Aucun sprint" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Aucun sprint</SelectItem>
                                            {sprints?.map((sprint: any) => (
                                                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                                                    Sprint {sprint.number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {!formData.project_id
                                            ? 'Sélectionnez d\'abord un projet'
                                            : 'Assignez à un sprint ou laissez dans le backlog'}
                                    </p>
                                </div>
                            </div>

                            {/* Acceptance Criteria Section */}
                            <div className="space-y-2">
                                <Label>Critères d'Acceptation (Optionnel)</Label>
                                <div className="p-4 rounded-lg border border-border bg-muted/20">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Vous pouvez ajouter les critères d'acceptation après avoir créé la user story
                                    </p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Étant donné que [contexte]</li>
                                        <li>Quand [action]</li>
                                        <li>Alors [résultat]</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/po/user-stories')}
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
                                        'Créer la User Story'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base">💡 Conseils pour rédiger de bonnes User Stories</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>• <strong>Soyez simple :</strong> Concentrez-vous sur le qui, quoi et pourquoi</p>
                        <p>• <strong>Soyez spécifique :</strong> Évitez le langage vague et soyez clair sur l'objectif</p>
                        <p>• <strong>Ajoutez de la valeur :</strong> Expliquez le bénéfice pour l'utilisateur ou l'entreprise</p>
                        <p>• <strong>Rendez-la testable :</strong> Définissez des critères d'acceptation clairs</p>
                        <p>• <strong>Gardez-la petite :</strong> Les user stories doivent pouvoir être terminées dans un sprint</p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}