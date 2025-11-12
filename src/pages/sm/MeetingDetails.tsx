import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '@/services/meetingService';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Edit,
    Trash2,
    User,
    FolderKanban,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {formatDuration, getMeetingTypeLabel, MEETING_TYPES} from '@/types/Meetingconstants';

export default function MeetingDetails() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: meeting, isLoading } = useQuery({
        queryKey: ['meeting', id],
        queryFn: () => meetingService.getById(Number(id)),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: () => meetingService.delete(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            toast.success('Réunion supprimée avec succès');
            navigate('/sm/meetings');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Échec de la suppression de la réunion');
        },
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!meeting) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Réunion non trouvée</p>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/sm/meeting')}
                        className="mt-4"
                    >
                        Retour aux Réunions
                    </Button>
                </div>
            </Layout>
        );
    }

    const meetingConfig = MEETING_TYPES[meeting.type];

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/sm/meetings')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux Réunions
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/sm/meetings/${id}/edit`)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Cela supprimera définitivement la réunion.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteMutation.mutate()}
                                        className="bg-destructive text-destructive-foreground"
                                    >
                                        {deleteMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Suppression...
                                            </>
                                        ) : (
                                            'Supprimer'
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Carte d'information de la réunion */}
                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 rounded-lg bg-primary/20">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{meeting.title}</CardTitle>
                                        <Badge
                                            variant="outline"
                                            className="mt-1"
                                        >
                                            {(() => {
                                                const IconComponent = MEETING_TYPES[meeting.type].icon;
                                                return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
                                            })()}
                                            {getMeetingTypeLabel(meeting.type)}
                                        </Badge>
                                    </div>
                                </div>
                                {meeting.description && (
                                    <p className="text-muted-foreground mt-4">
                                        {meeting.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Grille des détails de la réunion */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Durée */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Durée</p>
                                    <p className="text-lg font-semibold">{formatDuration(meeting.duration)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {meeting.duration} minutes
                                    </p>
                                </div>
                            </div>

                            {/* Date de création */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Créée le</p>
                                    <p className="text-lg font-semibold">
                                        {format(new Date(meeting.created_at), 'dd MMM yyyy')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(meeting.created_at), 'HH:mm')}
                                    </p>
                                </div>
                            </div>

                            {/* Organisateur */}
                            {meeting.user && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Organisée par</p>
                                        <p className="text-lg font-semibold">{meeting.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{meeting.user.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Projet */}
                            {meeting.project && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <FolderKanban className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Projet</p>
                                        <p className="text-lg font-semibold">{meeting.project.name}</p>
                                        {meeting.project.users && (
                                            <p className="text-xs text-muted-foreground">
                                                {meeting.project.users.length} membres notifiés
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Information sur le type de réunion */}
                        <Card className="bg-muted/30 border-border/50">
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    {(() => {
                                        const IconComponent = MEETING_TYPES[meeting.type].icon;
                                        return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
                                    })()}
                                    {getMeetingTypeLabel(meeting.type)}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {meetingConfig?.description}
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Durée recommandée :</span>
                                        <p className="font-medium">
                                            {formatDuration(meetingConfig?.recommendedDuration || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Plage de durée :</span>
                                        <p className="font-medium">
                                            {formatDuration(meetingConfig?.minDuration || 0)} - {formatDuration(meetingConfig?.maxDuration || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lien vers le projet */}
                        {meeting.project && (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/sm/projects/${meeting.project_id}`)}
                                >
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    Voir les détails du projet
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}