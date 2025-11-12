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
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { MeetingType } from '@/types';
import {formatDuration, MEETING_TYPE_OPTIONS, MEETING_TYPES, validateMeetingDuration} from '@/types/Meetingconstants';

import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditMeeting() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '' as MeetingType | '',
        duration: 0,
        project_id: '',
    });

    const [durationError, setDurationError] = useState<string>('');

    const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
        queryKey: ['meeting', id],
        queryFn: () => meetingService.getById(Number(id)),
        enabled: !!id,
    });

    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['my-projects'],
        queryFn: () => projectService.getMyProjects(),
    });

    // Pré-remplir le formulaire avec les données du meeting
    useEffect(() => {
        if (meeting) {
            setFormData({
                title: meeting.title,
                description: meeting.description || '',
                type: meeting.type,
                duration: meeting.duration,
                project_id: meeting.project_id.toString(),
            });
        }
    }, [meeting]);

    // Valider la durée
    useEffect(() => {
        if (formData.type && formData.duration > 0) {
            const validation = validateMeetingDuration(formData.type, formData.duration);
            setDurationError(validation.valid ? '' : validation.message || '');
        }
    }, [formData.type, formData.duration]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => meetingService.update(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
            queryClient.invalidateQueries({ queryKey: ['meeting', id] });
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            toast.success('Meeting updated successfully');
            navigate(`/sm/meetings/${id}`);
        },
        onError: (error: any) => {
            console.error('Error updating meeting:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to update meeting');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (durationError) {
            toast.error('Please fix errors before submitting');
            return;
        }

        const data = {
            ...formData,
            project_id: parseInt(formData.project_id),
        };

        updateMutation.mutate(data);
    };

    if (isLoadingMeeting) {
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
                    <p className="text-muted-foreground">Meeting not found</p>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/sm/meetings')}
                        className="mt-4"
                    >
                        Back to Meetings
                    </Button>
                </div>
            </Layout>
        );
    }

    const selectedType = formData.type ? MEETING_TYPES[formData.type] : null;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/sm/meetings/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Meeting</h1>
                        <p className="text-muted-foreground">Update meeting details</p>
                    </div>
                </div>

                <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                        <CardTitle>Meeting Details</CardTitle>
                        <CardDescription>
                            Modify the meeting parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type de meeting */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Meeting Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as MeetingType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select meeting type" />
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
                                            <strong>{selectedType.label}:</strong> {selectedType.description}
                                            <br />
                                            <span className="text-sm">Recommended duration: {formatDuration(selectedType.recommendedDuration)}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Titre */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Meeting Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter meeting title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add meeting agenda, goals, or notes..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Durée */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes) *</Label>
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
                                        Range: {formatDuration(selectedType.minDuration)} - {formatDuration(selectedType.maxDuration)}
                                    </p>
                                )}
                            </div>

                            {/* Projet */}
                            <div className="space-y-2">
                                <Label htmlFor="project">Project *</Label>
                                {isLoadingProjects ? (
                                    <div className="flex items-center justify-center p-3 border rounded-md">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Loading projects...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.project_id}
                                        onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects && projects.length > 0 ? (
                                                projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id.toString()}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="0" disabled>
                                                    No projects available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/sm/meetings/${id}`)}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-primary hover:opacity-90"
                                    disabled={updateMutation.isPending || !formData.project_id || !formData.type || !!durationError}
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Meeting'
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