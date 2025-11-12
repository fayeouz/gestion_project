import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    BookOpen,
    Search,
    Filter,
    CheckSquare,
    Plus,
    Target
} from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserStory } from '@/types';
import { useNavigate } from "react-router-dom";

export default function PMUserStories() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const navigate = useNavigate();

    const { data: userStories, isLoading } = useQuery({
        queryKey: ['user-stories'],
        queryFn: async () => {
            const response = await api.get<{ data: UserStory[] }>('/userStory');
            return response.data.data || response.data;
        },
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

    const filteredStories = userStories?.filter((story) => {
        const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            story.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: userStories?.length || 0,
        pending: userStories?.filter(s => s.status === 'pending').length || 0,
        active: userStories?.filter(s => s.status === 'active').length || 0,
        completed: userStories?.filter(s => s.status === 'completed').length || 0,
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Stories</h1>
                        <p className="text-muted-foreground">
                            Gérez toutes les user stories de vos projets
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-sm text-muted-foreground">Stories totales</p>
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
                                    placeholder="Rechercher des user stories..."
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

                {/* User Stories Grid */}
                {filteredStories && filteredStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStories.map((story) => (
                            <Card key={story.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge variant={getStatusVariant(story.status)} className="flex-shrink-0">
                                            {getStatusText(story.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base leading-tight line-clamp-1 text-ellipsis overflow-hidden break-words">
                                                {story.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-ellipsis overflow-hidden mt-1">
                                                {story.description || 'Aucune description fournie'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {story.progress !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progression</span>
                                                <span className="font-medium">{story.progress}%</span>
                                            </div>
                                            <Progress value={story.progress} className="h-2" />
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {story.tasks && story.tasks.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4" />
                                                <span>{story.tasks.length} tâche{story.tasks.length > 1 ? 's' : ''}</span>
                                            </div>
                                        )}

                                        {story.sprint_id && (
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                <span className="text-xs px-2 py-1 rounded bg-muted">
                                                    Dans le Sprint
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/pm/user-stories/${story.id}`)}
                                    >
                                        Voir les détails
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Aucune user story ne correspond à vos filtres'
                                    : 'Aucune user story pour le moment'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button className="bg-gradient-primary hover:opacity-90">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer la première User Story
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}