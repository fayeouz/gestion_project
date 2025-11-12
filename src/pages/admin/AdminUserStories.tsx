import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookOpen, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserStory } from '@/types';

export default function AdminUserStories() {
    const { data: userStories, isLoading } = useQuery({
        queryKey: ['all-user-stories'],
        queryFn: async () => {
            const response = await api.get('/userStory');
            // Vérifier si la réponse est déjà un tableau de données ou s'il est encapsulé
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
            console.log('User stories analysées :', data);
            return data;
        },
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
                    <h1 className="text-3xl font-bold">Toutes les User Stories</h1>
                    <p className="text-muted-foreground">Vue d'ensemble des user stories du système</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                ) : userStories && userStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userStories.map((story) => (
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
                                                <span className="text-xs px-2 py-1 rounded bg-muted">
                                                    Dans le Sprint
                                                </span>
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
                            Aucune user story dans le système
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}