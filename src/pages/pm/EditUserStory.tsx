import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userStoryService } from '@/services/userStoryService';
import { projectService } from '@/services/projectService';
import { useNavigate, useParams } from 'react-router-dom';
import {ArrowLeft, Save, Loader2, AlertTriangle} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {api} from "@/lib/api.ts";

export default function EditUserStory() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'backlog',
        product_backlog_id: '',
        sprint_id: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Récupérer les données de la user story
    const { data: userStory, isLoading, error } = useQuery({
        queryKey: ['user-story', id],
        queryFn: async () => {
            if (!id) throw new Error('No ID provided');
            return await userStoryService.getById(Number(id));
        },
        enabled: !!id,
        retry: 1,
    });

    // Récupérer les projets (backlogs) pour le dropdown
    const { data: backlogs, isLoading: loadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            try {
                // Utiliser le projectService pour être cohérent avec le reste de l'app
                const projects = await projectService.getAll();
                console.log('Projects loaded:', projects);
                return projects;
            } catch (error) {
                console.error('Error fetching projects:', error);
                return [];
            }
        },
    });

    // Récupérer les sprints pour le dropdown
    const { data: sprints } = useQuery({
        queryKey: ['sprints'],
        queryFn: async () => {
            try {
                const response = await api.get('/sprint');
                console.log('Sprints response:', response.data);
                return Array.isArray(response.data) ? response.data : (response.data?.data || []);
            } catch (error) {
                console.error('Error fetching sprints:', error);
                return [];
            }
        },
    });

    // Pré-remplir le formulaire quand les données sont chargées
    useEffect(() => {
        if (userStory) {
            console.log('User Story data:', userStory);
            setFormData({
                title: userStory.title || '',
                description: userStory.description || '',
                status: userStory.status || 'backlog',
                product_backlog_id: userStory.product_backlog_id?.toString() || '',
                sprint_id: userStory.sprint_id?.toString() || '',
            });
        }
    }, [userStory]);

    // Log pour déboguer les projets
    useEffect(() => {
        if (backlogs) {
            console.log('Backlogs/Projects loaded:', backlogs);
            console.log('Number of projects:', backlogs.length);
        }
    }, [backlogs]);

    // Mutation pour mettre à jour la user story
    const updateMutation = useMutation({
        mutationFn: (data: any) => userStoryService.update(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-story', id] });
            queryClient.invalidateQueries({ queryKey: ['user-stories'] });
            toast.success('User story updated successfully!');
            navigate(`/pm/user-stories/${id}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user story');
        }
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.product_backlog_id) {
            newErrors.product_backlog_id = 'Product backlog is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        // Préparer les données pour l'API
        const submitData: any = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            product_backlog_id: Number(formData.product_backlog_id),
        };

        // Ajouter sprint_id seulement s'il est défini
        if (formData.sprint_id) {
            submitData.sprint_id = Number(formData.sprint_id);
        }

        console.log('Submitting data:', submitData);
        updateMutation.mutate(submitData);
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

    if (error || !userStory) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-3" />
                            <p className="text-muted-foreground mb-2">
                                {error ? 'Error loading user story' : 'User story not found'}
                            </p>
                            {error && (
                                <p className="text-sm text-destructive mb-4">
                                    {(error as any).message || 'Unknown error'}
                                </p>
                            )}
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/pm/user-stories')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to User Stories
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                {/* Header */}
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/pm/user-stories/${id}`)}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to User Story
                    </Button>
                    <h1 className="text-3xl font-bold">Edit User Story</h1>
                    <p className="text-muted-foreground">
                        Update the details of your user story
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader>
                            <CardTitle>User Story Information</CardTitle>
                            <CardDescription>
                                Modify the user story details below
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="As a [user], I want to [goal]..."
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the user story in detail..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="backlog">Backlog</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_sprint">In Sprint</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Product Backlog */}
                            <div className="space-y-2">
                                <Label htmlFor="product_backlog_id">
                                    Product Backlog (Project) <span className="text-destructive">*</span>
                                </Label>
                                {loadingProjects ? (
                                    <div className="flex items-center justify-center h-10 border rounded-md bg-muted/50">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.product_backlog_id}
                                        onValueChange={(value) => handleChange('product_backlog_id', value)}
                                    >
                                        <SelectTrigger className={errors.product_backlog_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {backlogs && backlogs.length > 0 ? (
                                                backlogs.map((backlog: any) => (
                                                    <SelectItem key={backlog.id} value={backlog.id.toString()}>
                                                        {backlog.name || `Project #${backlog.id}`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    No projects available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.product_backlog_id && (
                                    <p className="text-sm text-destructive">{errors.product_backlog_id}</p>
                                )}
                                {backlogs && backlogs.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {backlogs.length} project{backlogs.length > 1 ? 's' : ''} available
                                    </p>
                                )}
                            </div>

                            {/* Sprint (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="sprint_id">Sprint (Optional)</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={formData.sprint_id || 'none'}
                                        onValueChange={(value) => handleChange('sprint_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="No sprint assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Sprint</SelectItem>
                                            {sprints && sprints.length > 0 && sprints.map((sprint: any) => (
                                                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                                                    {sprint.name || sprint.title || `Sprint #${sprint.id}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.sprint_id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleChange('sprint_id', '')}
                                            title="Clear sprint"
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex-1 sm:flex-none"
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/pm/user-stories/${id}`)}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </Layout>
    );
}