import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import {
    CheckSquare,
    Search,
    Filter,
    User,
    BookOpen,
    Calendar,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function PMAllTasks() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['all-tasks'],
        queryFn: () => taskService.getAll(),
        refetchOnMount: true,
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'active': return 'default';
            case 'completed': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'active': return 'Actif';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    const filteredTasks = tasks?.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tasks?.length || 0,
        pending: tasks?.filter(t => t.status === 'pending').length || 0,
        active: tasks?.filter(t => t.status === 'active').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Toutes les Tâches</h1>
                    <p className="text-muted-foreground">
                        Gérez et suivez toutes les tâches de vos projets
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-sm text-muted-foreground">Tâches totales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
                            <p className="text-sm text-muted-foreground">En attente</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-primary">{stats.active}</div>
                            <p className="text-sm text-muted-foreground">Actives</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-success">{stats.completed}</div>
                            <p className="text-sm text-muted-foreground">Terminées</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher des tâches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="active">Actif</SelectItem>
                                    <SelectItem value="completed">Terminé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Grid */}
                {filteredTasks && filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map((task) => (
                            <Card key={task.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge variant={getStatusVariant(task.status)} className="flex-shrink-0">
                                            {getStatusText(task.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base leading-tight line-clamp-1 text-ellipsis overflow-hidden break-words">
                                                {task.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-ellipsis overflow-hidden mt-1">
                                                {task.description || 'Aucune description fournie'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {task.userStory && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                <span className="truncate">{task.userStory.title}</span>
                                            </div>
                                        )}

                                        {task.assignedUser && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="bg-primary/20 text-xs">
                                                        {task.assignedUser.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate">{task.assignedUser.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button variant="outline" className="w-full">
                                        Voir les détails
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Aucune tâche ne correspond à vos filtres'
                                    : 'Aucune tâche pour le moment'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}