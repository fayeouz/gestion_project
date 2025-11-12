import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { CheckSquare, User, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminTasks() {
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['all-tasks'],
        queryFn: () => taskService.getAll(),
        staleTime: 3 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
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

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold">Toutes les Tâches</h1>
                    <p className="text-muted-foreground">Vue d'ensemble des tâches du système</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                ) : tasks && tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
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
                                                <User className="h-4 w-4" />
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
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Aucune tâche dans le système
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}