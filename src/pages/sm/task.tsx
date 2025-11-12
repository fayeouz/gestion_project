import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { CheckSquare, Plus, Search, Trash2, Edit, User, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function SMTasks() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['all-tasks'],
        queryFn: async () => {
            const response = await taskService.getAll();
            return response;
        },
        staleTime: 3 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: taskService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Tâche supprimée avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            taskService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
            toast.success('Statut mis à jour');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        },
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'active':
                return 'default';
            case 'completed':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'active':
                return 'En cours';
            case 'completed':
                return 'Terminée';
            default:
                return status;
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleStatusChange = (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    // Filtrage des tâches
    const filteredTasks = tasksData?.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Statistiques
    const stats = {
        total: tasksData?.length || 0,
        pending: tasksData?.filter((t) => t.status === 'pending').length || 0,
        active: tasksData?.filter((t) => t.status === 'active').length || 0,
        completed: tasksData?.filter((t) => t.status === 'completed').length || 0,
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Toutes les Tâches</h1>
                        <p className="text-muted-foreground">Gérer et suivre toutes les tâches du système</p>
                    </div>
                    <Button
                        onClick={() => navigate('/tasks/create')}
                        className="bg-gradient-primary hover:opacity-90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En attente</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-secondary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En cours</p>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Terminées</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtres et Recherche */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une tâche..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="active">En cours</SelectItem>
                                    <SelectItem value="completed">Terminées</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des Tâches */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                ) : filteredTasks && filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                            <Card
                                key={task.id}
                                className="bg-gradient-card border-border/50 hover:shadow-glow transition-all"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <CheckSquare className="h-5 w-5 text-primary" />
                                            <CardTitle className="line-clamp-1 text-base">
                                                {task.title}
                                            </CardTitle>
                                        </div>
                                        <Badge variant={getStatusVariant(task.status)}>
                                            {getStatusLabel(task.status)}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {task.description || 'Pas de description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Informations */}
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {task.assignedUser && (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>{task.assignedUser.name}</span>
                                            </div>
                                        )}
                                        {task.userStory && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="line-clamp-1">
                                                    US: {task.userStory.title}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            ID: {task.id}
                                        </div>
                                    </div>

                                    {/* Changer le statut */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Changer le statut</label>
                                        <Select
                                            value={task.status}
                                            onValueChange={(value) => handleStatusChange(task.id, value)}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">En attente</SelectItem>
                                                <SelectItem value="active">En cours</SelectItem>
                                                <SelectItem value="completed">Terminée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(task.id)}
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
                        <CardContent className="py-12 text-center">
                            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Aucune tâche ne correspond aux filtres'
                                    : 'Aucune tâche dans le système'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button
                                    onClick={() => navigate('/tasks/create')}
                                    className="bg-gradient-primary hover:opacity-90"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Task
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}