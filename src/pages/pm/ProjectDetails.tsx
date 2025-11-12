import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { sprintService } from '@/services/sprintService';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Users,
    CheckSquare,
    BookOpen,
    Target,
    Edit,
    Trash2,
    UserPlus,
    Play,
    Pause,
    CheckCircle2,
    GripVertical,
    MoreVertical,
    AlertTriangle,
    Loader2,
    Search,
    Check
} from 'lucide-react';
import { format, differenceInDays, isValid, parseISO } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { userService, User } from '@/services/userService';

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectService.getById(Number(id)),
        enabled: !!id,
    });

    // ✅ Récupérer les user stories avec les stats
    const { data: backlogData, isLoading: loadingBacklog } = useQuery({
        queryKey: ['project-backlog-stats', id],
        queryFn: () => projectService.getProjectBacklogWithStats(Number(id)),
        enabled: !!id,
    });

    // ✅ Utiliser les sprints qui viennent directement du projet
    const projectSprints = project?.sprints || [];
    const loadingSprints = isLoading;

    // Debug: voir la structure des sprints
    if (projectSprints.length > 0) {
        console.log('Premier sprint:', projectSprints[0]);
    }

    // ✅ Récupérer tous les utilisateurs disponibles pour ce projet
    const { data: allUsers, isLoading: loadingUsers } = useQuery<User[]>({
        queryKey: ['available-users', id],
        queryFn: () => userService.getAvailableUsersForProject(Number(id)),
        enabled: showAddMemberDialog,
    });

    // ✅ Mutation pour supprimer le projet
    const deleteMutation = useMutation({
        mutationFn: () => projectService.delete(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project deleted successfully!');
            navigate('/pm/projects');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete project');
        }
    });

    // ✅ Mutation pour ajouter un membre
    const addMemberMutation = useMutation({
        mutationFn: (userId: number) => projectService.addUsers(Number(id), [userId]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            toast.success('Member added successfully!');
            setShowAddMemberDialog(false);
            setSelectedUserId('');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add member');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setShowDeleteDialog(false);
    };

    const handleAddMember = () => {
        if (!selectedUserId) {
            toast.error('Please select a user');
            return;
        }
        addMemberMutation.mutate(Number(selectedUserId));
    };

    // Helper function to safely format dates
    const formatDate = (dateString: string | null | undefined, formatStr: string): string => {
        if (!dateString) return 'N/A';

        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
            if (!isValid(date)) return 'Invalid date';
            return format(date, formatStr);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Les utilisateurs disponibles sont déjà filtrés par le backend
    const availableUsers = allUsers || [];

    // Filtrer les utilisateurs selon la recherche
    const filteredUsers = availableUsers.filter((user: User) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'completed': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="h-4 w-4" />;
            case 'pending': return <Pause className="h-4 w-4" />;
            case 'completed': return <CheckCircle2 className="h-4 w-4" />;
            default: return null;
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };

    const getStoryStatusVariant = (status: string) => {
        switch (status) {
            case 'backlog': return 'secondary';
            case 'in_progress': return 'default';
            case 'done': return 'outline';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
                    <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
                    <Button onClick={() => navigate('/pm/projects')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Button>
                </div>
            </Layout>
        );
    }

    const daysLeft = differenceInDays(new Date(project.deadline), new Date());
    const projectProgress = backlogData?.totalProgress || 0;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/pm/projects')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <p className="text-muted-foreground">{project.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(`/pm/projects/${id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            {getStatusIcon(project.status)}
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getStatusVariant(project.status)}>
                                {project.status}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.users?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Active members</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">User Stories</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backlogData?.totalStories || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {backlogData?.completedStories || 0} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{daysLeft > 0 ? daysLeft : 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Until {format(new Date(project.deadline), 'MMM dd, yyyy')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                        <CardDescription>Overall completion based on user stories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{Math.round(projectProgress)}% Complete</span>
                                <span className="text-sm text-muted-foreground">
                                    {backlogData?.completedStories || 0} / {backlogData?.totalStories || 0} stories
                                </span>
                            </div>
                            <Progress value={projectProgress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="sprints">Sprints</TabsTrigger>
                        <TabsTrigger value="backlog">Backlog</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                        <p className="text-lg">{format(new Date(project.start_date), 'MMMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">End Date</p>
                                        <p className="text-lg">{format(new Date(project.deadline), 'MMMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                        <p className="text-lg">
                                            {differenceInDays(new Date(project.deadline), new Date(project.start_date))} days
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <div className="mt-1">
                                            <Badge variant={getStatusVariant(project.status)}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="team">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>People working on this project</CardDescription>
                                    </div>
                                    <Button onClick={() => setShowAddMemberDialog(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Member
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {project.users && project.users.length > 0 ? (
                                    <div className="space-y-4">
                                        {project.users.map((user: any) => (
                                            <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                {user.role && (
                                                    <Badge variant="outline">{user.role}</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">No team members yet</p>
                                        <Button onClick={() => setShowAddMemberDialog(true)}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add First Member
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sprints">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Sprints</CardTitle>
                                        <CardDescription>Project sprints overview</CardDescription>
                                    </div>
                                    <Button onClick={() => navigate('/pm/sprints/new')}>
                                        <Target className="mr-2 h-4 w-4" />
                                        Create Sprint
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingSprints ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : projectSprints.length > 0 ? (
                                    <div className="space-y-4">
                                        {projectSprints.map((sprint: any) => {
                                            // Déterminer les propriétés de date (différentes API peuvent utiliser des noms différents)
                                            const startDate = sprint.start_date || sprint.startDate || sprint.start;
                                            const endDate = sprint.end_date || sprint.endDate || sprint.end;

                                            return (
                                                <div
                                                    key={sprint.id}
                                                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/pm/sprints/${sprint.id}`)}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold">{sprint.name || sprint.title || `Sprint ${sprint.id}`}</h4>
                                                            <Badge variant={getStatusVariant(sprint.status)}>
                                                                {sprint.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(startDate, 'MMM dd')} - {formatDate(endDate, 'MMM dd, yyyy')}
                                                        </p>
                                                        {sprint.goal && (
                                                            <p className="text-sm mt-1">{sprint.goal}</p>
                                                        )}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/pm/sprints/${sprint.id}/edit`);
                                                            }}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle delete
                                                            }}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )})}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">No sprints yet</p>
                                        <Button onClick={() => navigate('/pm/sprints/new')}>
                                            <Target className="mr-2 h-4 w-4" />
                                            Create First Sprint
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="backlog">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Product Backlog</CardTitle>
                                        <CardDescription>User stories for this project</CardDescription>
                                    </div>
                                    <Button onClick={() => navigate('/pm/create-userStory')}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Create User Story
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingBacklog ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                    </div>
                                ) : backlogData?.stories && backlogData.stories.length > 0 ? (
                                    <div className="space-y-3">
                                        {backlogData.stories.map((story: any) => (
                                            <div
                                                key={story.id}
                                                className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/pm/user-stories/${story.id}`)}
                                            >
                                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <h4 className="font-medium">{story.title}</h4>
                                                        <Badge variant={getStoryStatusVariant(story.status)}>
                                                            {story.status}
                                                        </Badge>
                                                        {story.priority && (
                                                            <Badge variant={getPriorityVariant(story.priority)}>
                                                                {story.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {story.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {story.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        {story.story_points && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckSquare className="h-3 w-3" />
                                                                {story.story_points} points
                                                            </span>
                                                        )}
                                                        {story.progress !== undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={story.progress} className="w-16 h-1" />
                                                                <span>{story.progress}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">No user stories yet</p>
                                        <Button onClick={() => navigate('/pm/create-userStory')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Create First User Story
                                        </Button>
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
                                Delete Project?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{project.name}</strong>?
                                This action cannot be undone. All associated user stories, sprints,
                                and tasks will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Add Member Dialog */}
                <Dialog open={showAddMemberDialog} onOpenChange={(open) => {
                    setShowAddMemberDialog(open);
                    if (!open) {
                        setSearchQuery('');
                        setSelectedUserId('');
                    }
                }}>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>
                                Search and select a user to add to this project
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Users List */}
                            {loadingUsers ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {filteredUsers.map((user: User) => (
                                        <div
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id.toString())}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                                ${selectedUserId === user.id.toString()
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent bg-muted/20 hover:bg-muted/40 hover:border-border/50'
                                            }
                                            `}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/20">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                {user.role && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {user.role}
                                                    </Badge>
                                                )}
                                            </div>
                                            {selectedUserId === user.id.toString() && (
                                                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : availableUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        All users are already members of this project
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No users found matching "{searchQuery}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddMemberDialog(false);
                                    setSearchQuery('');
                                    setSelectedUserId('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddMember}
                                disabled={!selectedUserId || addMemberMutation.isPending}
                            >
                                {addMemberMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Member
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}