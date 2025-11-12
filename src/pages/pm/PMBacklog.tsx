import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import {
    ListTodo,
    BookOpen,
    FolderKanban,
    Plus,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PMBacklogs() {
    const navigate = useNavigate();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['pm-backlogs'],
        queryFn: () => projectService.getMyProjects(),
        refetchOnMount: true,
    });

    // Récupérer les stats pour chaque projet
    const projectsWithStats = useQuery({
        queryKey: ['pm-backlogs-stats', projects?.map(p => p.id)],
        queryFn: async () => {
            if (!projects || projects.length === 0) return [];

            const statsPromises = projects.map(async (project) => {
                const stats = await projectService.getProjectBacklogWithStats(project.id);
                return {
                    ...project,
                    backlogStats: stats.stats
                };
            });

            return Promise.all(statsPromises);
        },
        enabled: !!projects && projects.length > 0,
    });

    // Calculer les stats globales
    const globalStats = projectsWithStats.data?.reduce((acc, project) => {
        return {
            totalStories: acc.totalStories + (project.backlogStats?.total || 0),
            inBacklog: acc.inBacklog + (project.backlogStats?.in_backlog || 0),
            inSprint: acc.inSprint + (project.backlogStats?.in_sprint || 0),
            completed: acc.completed + (project.backlogStats?.completed || 0),
        };
    }, { totalStories: 0, inBacklog: 0, inSprint: 0, completed: 0 }) || {
        totalStories: 0,
        inBacklog: 0,
        inSprint: 0,
        completed: 0
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    if (isLoading || projectsWithStats.isLoading) {
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

    const projectsData = projectsWithStats.data || projects || [];

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Backlogs Produit</h1>
                    <p className="text-muted-foreground">
                        Gérez les backlogs produit de tous vos projets
                    </p>
                </div>

                {/* Stats Globales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{projects?.length || 0}</div>
                            <p className="text-sm text-muted-foreground">Projets totaux</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-primary">{globalStats.totalStories}</div>
                            <p className="text-sm text-muted-foreground">User Stories totales</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-muted-foreground">{globalStats.inBacklog}</div>
                            <p className="text-sm text-muted-foreground">Dans les backlogs</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-warning">{globalStats.inSprint}</div>
                            <p className="text-sm text-muted-foreground">Dans les sprints</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Backlogs par Projet */}
                {projectsData && projectsData.length > 0 ? (
                    <div className="space-y-4">
                        {projectsData.map((project) => (
                            <Card key={project.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FolderKanban className="h-5 w-5 text-primary" />
                                                <CardTitle>{project.name}</CardTitle>
                                                <Badge variant="outline">{getStatusText(project.status)}</Badge>
                                            </div>
                                            <CardDescription>
                                                {project.description || 'Aucune description'}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/pm/projects/${project.id}/backlog`)}
                                        >
                                            Voir le backlog
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <div className="p-2 rounded-lg bg-primary/20">
                                                <ListTodo className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {project.backlogStats?.in_backlog || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Éléments en backlog</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <div className="p-2 rounded-lg bg-success/20">
                                                <BookOpen className="h-5 w-5 text-success" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {project.backlogStats?.total || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">User Stories</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                                            <div className="p-2 rounded-lg bg-warning/20">
                                                <BookOpen className="h-5 w-5 text-warning" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">
                                                    {project.backlogStats?.in_sprint || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Dans le sprint</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">Aucun projet pour le moment</p>
                            <Button
                                className="bg-gradient-primary hover:opacity-90"
                                onClick={() => navigate('/pm/create-project')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Créer votre premier projet
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}