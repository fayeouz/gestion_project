import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userStoryService } from '@/services/userStoryService';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Target,
    CheckSquare,
    Edit,
    Trash2,
    Plus,
    AlertTriangle,
    FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UserStoryDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { data: userStory, isLoading, error } = useQuery({
        queryKey: ['user-stories', id],
        queryFn: async () => {
            if (!id) throw new Error('No ID provided');
            return await userStoryService.getById(Number(id));
        },
        enabled: !!id,
        retry: 1,
    });

    const deleteMutation = useMutation({
        mutationFn: () => userStoryService.delete(Number(id)),
        onSuccess: async () => {
            // Invalidate all user-stories queries
            await queryClient.invalidateQueries({ queryKey: ['user-stories'] });
            toast.success('User story deleted successfully!');
            // Small delay to ensure cache is updated before navigation
            setTimeout(() => {
                navigate('/pm/user-stories');
            }, 100);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete user story');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setShowDeleteDialog(false);
    };

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'secondary';
            case 'backlog': return 'secondary';
            case 'active': return 'default';
            case 'in_sprint': return 'default';
            case 'completed': return 'outline';
            default: return 'outline';
        }
    };

    const getTaskStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'secondary';
            case 'active': return 'default';
            case 'completed': return 'outline';
            default: return 'outline';
        }
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

    const tasks = userStory.tasks || [];
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const progress = userStory.progress || (tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0);

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/pm/user-stories')}
                            className="mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User Stories
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{userStory.title}</h1>
                            <Badge variant={getStatusVariant(userStory.status)} className="gap-1">
                                {userStory.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {userStory.description || 'No description provided'}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progress
                            </CardTitle>
                            <Target className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progress}%</div>
                            <Progress value={progress} className="mt-2 h-2" />
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tasks
                            </CardTitle>
                            <CheckSquare className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tasks.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {completedTasks} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Sprint
                            </CardTitle>
                            <FolderOpen className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            {userStory.sprint_id ? (
                                <>
                                    <div className="text-lg font-bold">
                                        Sprint #{userStory.sprint_id}
                                    </div>
                                    <Button
                                        variant="link"
                                        className="px-0 h-auto text-xs"
                                        onClick={() => navigate(`/pm/sprints/${userStory.sprint_id}`)}
                                    >
                                        View sprint
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No sprint assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-gradient-card">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">
                            Tasks
                            {tasks.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {tasks.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Story Information */}
                            <Card className="bg-gradient-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Story Information</CardTitle>
                                    <CardDescription>General story details and status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Status</p>
                                            <Badge variant={getStatusVariant(userStory.status)}>
                                                {userStory.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Progress</p>
                                            <p className="font-medium">{progress}%</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Sprint ID</p>
                                            <p className="font-medium">{userStory.sprint_id || 'Not assigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Backlog ID</p>
                                            <p className="font-medium">{userStory.product_backlog_id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{userStory.description || 'No description'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Timeline */}
                            <Card className="bg-gradient-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Activity Timeline</CardTitle>
                                    <CardDescription>Recent updates and changes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {userStory.created_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-medium">Story created</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(userStory.created_at), 'PPp')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {userStory.updated_at && userStory.updated_at !== userStory.created_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-medium">Story updated</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(userStory.updated_at), 'PPp')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-6">
                        <Card className="bg-gradient-card border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Tasks</CardTitle>
                                        <CardDescription>
                                            {tasks.length} task{tasks.length !== 1 ? 's' : ''} •{' '}
                                            {completedTasks} completed •{' '}
                                            {tasks.length - completedTasks} remaining
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {tasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {tasks.map((task: any) => (
                                            <div
                                                key={task.id}
                                                className="flex items-start gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer border border-transparent hover:border-border/50"
                                                onClick={() => navigate(`/pm/tasks/${task.id}`)}
                                            >
                                                <CheckSquare className="h-5 w-5 text-muted-foreground mt-1" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant={getTaskStatusVariant(task.status)}>
                                                                    {task.status}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium">{task.title}</h4>
                                                            {task.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {task.assignedUser && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="bg-primary/20 text-xs">
                                                                    {task.assignedUser.name.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{task.assignedUser.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">No tasks yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Delete User Story?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{userStory.title}</strong>?
                                This action cannot be undone. All associated tasks will also be removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Story'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}