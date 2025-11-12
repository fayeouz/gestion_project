import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '@/services/meetingService';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { MeetingType } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {formatDuration, MEETING_TYPE_OPTIONS, MEETING_TYPES, validateMeetingDuration} from '@/types/Meetingconstants';

export default function CreateMeeting() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = authService.getCurrentUser();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '' as MeetingType | '',
        duration: 0,
        project_id: '',
        user_id: currentUser?.id || 0,
    });

    const [durationError, setDurationError] = useState<string>('');

    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['my-projects'],
        queryFn: () => projectService.getMyProjects(),
    });

    // Mettre à jour la durée recommandée quand le type change
    useEffect(() => {
        if (formData.type) {
            const recommended = MEETING_TYPES[formData.type].recommendedDuration;
            setFormData(prev => ({ ...prev, duration: recommended }));
            setDurationError('');
        }
    }, [formData.type]);

    // Valider la durée
    useEffect(() => {
        if (formData.type && formData.duration > 0) {
            const validation = validateMeetingDuration(formData.type, formData.duration);
            setDurationError(validation.valid ? '' : validation.message || '');
        }
    }, [formData.type, formData.duration]);

    const createMutation = useMutation({
        mutationFn: (data: any) => meetingService.create(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            toast.success('Réunion créée avec succès ! Notifications envoyées aux membres du projet.');
            navigate('/sm/meetings');
        },
        onError: (error: any) => {
            console.error('Erreur lors de la création:', error);
            toast.error(error.response?.data?.message || error.message || 'Échec de la création de la réunion');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (durationError) {
            toast.error('Veuillez corriger les erreurs avant de soumettre');
            return;
        }

        const data = {
            ...formData,
            project_id: parseInt(formData.project_id),
            user_id: currentUser?.id || 0,
        };

        createMutation.mutate(data);
    };

    const selectedType = formData.type ? MEETING_TYPES[formData.type] : null;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold">Planifier une Réunion</h1>
                    <p className="text-muted-foreground">Créez une nouvelle cérémonie Scrum pour votre équipe</p>
                </div>

                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <CardTitle>Détails de la Réunion</CardTitle>
                        <CardDescription>
                            Configurez les paramètres de la réunion et notifiez les membres de l'équipe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type de réunion */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type de Réunion *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as MeetingType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez le type de réunion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEETING_TYPE_OPTIONS.map((option) => {
                                            const IconComponent = option.icon;
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        {IconComponent && <IconComponent className="h-4 w-4" />}
                                                        <div>
                                                            <div className="font-medium">{option.label}</div>
                                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>

                                {selectedType && (
                                    <Alert className="bg-muted/30 border-border/50">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>{selectedType.label} :</strong> {selectedType.description}
                                            <br />
                                            <span className="text-sm">Durée recommandée : {formatDuration(selectedType.recommendedDuration)}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Titre */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de la Réunion *</Label>
                                <Input
                                    id="title"
                                    placeholder={selectedType ? `${selectedType.label} - Sprint #X` : "Entrez le titre de la réunion"}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optionnel)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Ajoutez l'ordre du jour, les objectifs ou des notes..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Durée */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Durée (minutes) *</Label>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="60"
                                        value={formData.duration || ''}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                        min={selectedType?.minDuration}
                                        max={selectedType?.maxDuration}
                                        required
                                        className={durationError ? 'border-destructive' : ''}
                                    />
                                    {formData.duration > 0 && (
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                            = {formatDuration(formData.duration)}
                                        </span>
                                    )}
                                </div>
                                {durationError && (
                                    <p className="text-sm text-destructive">{durationError}</p>
                                )}
                                {selectedType && (
                                    <p className="text-xs text-muted-foreground">
                                        Plage : {formatDuration(selectedType.minDuration)} - {formatDuration(selectedType.maxDuration)}
                                    </p>
                                )}
                            </div>

                            {/* Projet */}
                            <div className="space-y-2">
                                <Label htmlFor="project">Projet *</Label>
                                {isLoadingProjects ? (
                                    <div className="flex items-center justify-center p-3 border rounded-md">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Chargement des projets...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.project_id}
                                        onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un projet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects && projects.length > 0 ? (
                                                projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4" />
                                                            <span>{project.name}</span>
                                                            {project.users && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({project.users.length} membres)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="0" disabled>
                                                    Aucun projet disponible
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Info notification */}
                            <Alert className="bg-primary/10 border-primary/30">
                                <Calendar className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Note :</strong> Tous les membres du projet seront automatiquement notifiés de cette réunion via le système de notification.
                                </AlertDescription>
                            </Alert>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/sm/meeting')}
                                    disabled={createMutation.isPending}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-primary hover:opacity-90"
                                    disabled={createMutation.isPending || !formData.project_id || !formData.type || !!durationError}
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création & Notification...
                                        </>
                                    ) : (
                                        'Créer la Réunion'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}