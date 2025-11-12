import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function EditProject() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        deadline: '',
        status: 'pending',
        progress: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Récupérer les données du projet
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectService.getById(Number(id)),
        enabled: !!id,
    });

    // Pré-remplir le formulaire quand les données sont chargées
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
                status: project.status || 'pending',
                progress: project.progress || 0
            });
        }
    }, [project]);

    // Mutation pour mettre à jour le projet
    const updateMutation = useMutation({
        mutationFn: (data: any) => projectService.update(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project updated successfully!');
            navigate(`/pm/projects/${id}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update project');
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

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Deadline is required';
        }

        if (formData.start_date && formData.deadline) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.deadline);
            if (end < start) {
                newErrors.deadline = 'Deadline must be after start date';
            }
        }

        if (formData.progress < 0 || formData.progress > 100) {
            newErrors.progress = 'Progress must be between 0 and 100';
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

        updateMutation.mutate(formData);
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

    if (!project) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Project not found</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/pm/projects')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
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
                        onClick={() => navigate(`/pm/projects/${id}`)}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Project
                    </Button>
                    <h1 className="text-3xl font-bold">Edit Project</h1>
                    <p className="text-muted-foreground">
                        Update the details of your project
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                            <CardDescription>
                                Modify the project details below
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Project Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Project Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter project name"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Enter project description"
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">
                                        Deadline <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => handleChange('deadline', e.target.value)}
                                        className={errors.deadline ? 'border-destructive' : ''}
                                    />
                                    {errors.deadline && (
                                        <p className="text-sm text-destructive">{errors.deadline}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status and Progress */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="progress">
                                        Progress (%)
                                    </Label>
                                    <Input
                                        id="progress"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                                        className={errors.progress ? 'border-destructive' : ''}
                                    />
                                    {errors.progress && (
                                        <p className="text-sm text-destructive">{errors.progress}</p>
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
                                    onClick={() => navigate(`/pm/projects/${id}`)}
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