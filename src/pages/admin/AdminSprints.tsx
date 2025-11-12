import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Calendar, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export default function AdminSprints() {
    const { data: sprints, isLoading, error } = useQuery({
        queryKey: ['all-sprints'],
        queryFn: async () => {
            try {
                const response = await api.get('/sprint');
                console.log('Raw API response:', response);

                // Gestion flexible de la réponse
                let data = response.data;

                if (!data) {
                    console.warn('No data in response');
                    return [];
                }

                // Si c'est wrappé dans un objet data
                if (data.data !== undefined) {
                    data = data.data;
                }

                // S'assurer que c'est un tableau
                if (!Array.isArray(data)) {
                    console.warn('Data is not an array:', data);
                    return [];
                }

                console.log('Processed sprints:', data);
                return data;
            } catch (err) {
                console.error('Error fetching sprints:', err);
                return [];
            }
        },
        staleTime: 3 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    const getSprintStatus = (sprint: any) => {
        if (!sprint.start_date || !sprint.deadline) return 'upcoming';

        const today = new Date();
        const startDate = new Date(sprint.start_date);
        const deadline = new Date(sprint.deadline);

        if (today < startDate) return 'upcoming';
        if (today > deadline) return 'completed';
        return 'active';
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'upcoming': return 'secondary';
            case 'active': return 'default';
            case 'completed': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'upcoming': return 'À venir';
            case 'active': return 'Actif';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    const calculateProgress = (sprint: any) => {
        if (!sprint.start_date || !sprint.deadline) return 0;

        const today = new Date();
        const startDate = new Date(sprint.start_date);
        const deadline = new Date(sprint.deadline);

        const totalDays = differenceInDays(deadline, startDate);
        const elapsedDays = differenceInDays(today, startDate);

        if (elapsedDays < 0) return 0;
        if (elapsedDays > totalDays) return 100;

        return Math.round((elapsedDays / totalDays) * 100);
    };

    console.log('Component - Sprints:', sprints);
    console.log('Component - Loading:', isLoading);
    console.log('Component - Error:', error);

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold">Tous les Sprints</h1>
                        <p className="text-muted-foreground">Vue d'ensemble des sprints du système</p>
                    </div>
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Chargement des sprints...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold">Tous les Sprints</h1>
                        <p className="text-muted-foreground">Vue d'ensemble des sprints du système</p>
                    </div>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-destructive">Erreur lors du chargement des sprints</p>
                            <p className="text-muted-foreground mt-2">{error.message}</p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold">Tous les Sprints</h1>
                    <p className="text-muted-foreground">Vue d'ensemble des sprints du système</p>
                </div>

                {sprints && sprints.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sprints.map((sprint) => {
                            const status = getSprintStatus(sprint);
                            const progress = calculateProgress(sprint);

                            return (
                                <Card key={sprint.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <Badge variant={getStatusVariant(status)} className="flex-shrink-0">
                                                {getStatusText(status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-base leading-tight line-clamp-1 text-ellipsis overflow-hidden break-words">
                                                    Sprint {sprint.number || 'N/A'}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 text-ellipsis overflow-hidden mt-1">
                                                    {sprint.objective || 'Aucun objectif fourni'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* ... reste du contenu identique ... */}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Aucun sprint dans le système
                            {sprints && <p className="text-xs mt-2">Données: {JSON.stringify(sprints)}</p>}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}