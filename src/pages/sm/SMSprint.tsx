import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintService } from '@/services/sprintService';
import { Sprint } from '@/types';
import { Calendar, Target, Clock, Trash2, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {useNavigate} from "react-router-dom";

export default function SMSprint() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [formData, setFormData] = useState({
        number: '',
        start_date: '',
        deadline: '',
        objective: '',
        project_id: '',
    });

    const { data: sprints, isLoading } = useQuery({
        queryKey: ['all-sprints'],
        queryFn: sprintService.getAll,
        staleTime: 3 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: sprintService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-sprints'] });
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success('Sprint créé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la création du sprint');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Sprint> }) =>
            sprintService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-sprints'] });
            setIsEditDialogOpen(false);
            setSelectedSprint(null);
            resetForm();
            toast.success('Sprint mis à jour avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du sprint');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: sprintService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-sprints'] });
            toast.success('Sprint supprimé avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression du sprint');
        },
    });

    const getStatusBadge = (sprint: Sprint) => {
        const today = new Date();
        const startDate = new Date(sprint.start_date);
        const deadline = new Date(sprint.deadline);

        if (today < startDate) {
            return <Badge variant="secondary">À venir</Badge>;
        } else if (today > deadline) {
            return <Badge variant="outline">Terminé</Badge>;
        } else {
            return <Badge variant="default">En cours</Badge>;
        }
    };

    const resetForm = () => {
        setFormData({
            number: '',
            start_date: '',
            deadline: '',
            objective: '',
            project_id: '',
        });
    };

    const handleCreate = () => {
        createMutation.mutate({
            number: parseInt(formData.number),
            start_date: formData.start_date,
            deadline: formData.deadline,
            objective: formData.objective,
            project_id: parseInt(formData.project_id),
        });
    };

    const handleEdit = (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setFormData({
            number: sprint.number.toString(),
            start_date: sprint.start_date,
            deadline: sprint.deadline,
            objective: sprint.objective,
            project_id: sprint.project_id.toString(),
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedSprint) return;
        updateMutation.mutate({
            id: selectedSprint.id,
            data: {
                number: parseInt(formData.number),
                start_date: formData.start_date,
                deadline: formData.deadline,
                objective: formData.objective,
                project_id: parseInt(formData.project_id),
            },
        });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sprint ?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Tous les Sprints</h1>
                        <p className="text-muted-foreground">Vue d'ensemble des sprints système</p>
                    </div>
                    <Button onClick={() => navigate(`/sm/manage-sprints`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Sprint
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                ) : sprints && sprints.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sprints.map((sprint) => (
                            <Card key={sprint.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-primary" />
                                            <CardTitle>Sprint {sprint.number}</CardTitle>
                                        </div>
                                        {getStatusBadge(sprint)}
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {sprint.objective}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {new Date(sprint.start_date).toLocaleDateString('fr-FR')} - {new Date(sprint.deadline).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        {sprint.duration_days !== undefined && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {sprint.duration_days} jours
                                                    {sprint.days_left !== undefined && ` (reste ${sprint.days_left} jours)`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-xs px-2 py-1 rounded bg-muted inline-block">
                                            Projet ID: {sprint.project_id}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(sprint)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(sprint.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Aucun sprint dans le système
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dialog de création */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau sprint</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations du sprint (durée: 2-4 semaines)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="number">Numéro du sprint</Label>
                            <Input
                                id="number"
                                type="number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="project_id">ID du projet</Label>
                            <Input
                                id="project_id"
                                type="number"
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="start_date">Date de début</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="deadline">Date de fin</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="objective">Objectif</Label>
                            <Textarea
                                id="objective"
                                value={formData.objective}
                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                placeholder="Objectif du sprint..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Création...' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de modification */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le sprint</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du sprint
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit_number">Numéro du sprint</Label>
                            <Input
                                id="edit_number"
                                type="number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_project_id">ID du projet</Label>
                            <Input
                                id="edit_project_id"
                                type="number"
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_start_date">Date de début</Label>
                            <Input
                                id="edit_start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_deadline">Date de fin</Label>
                            <Input
                                id="edit_deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_objective">Objectif</Label>
                            <Textarea
                                id="edit_objective"
                                value={formData.objective}
                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}