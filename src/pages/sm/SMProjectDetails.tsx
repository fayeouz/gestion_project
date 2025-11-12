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
import { format, differenceInDays } from 'date-fns';
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

export default function SMProjectDetails() {
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
            case 'in_sprint': return 'default';
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

    const daysUntilDeadline = differenceInDays(new Date(project.deadline), new Date());
    const isOverdue = daysUntilDeadline < 0;

    const userStories = backlogData?.userStories || [];
    const stats = backlogData?.stats || { total: 0, in_backlog: 0, in_sprint: 0, completed: 0 };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/pm/projects')}
                            className="mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <Badge variant={getStatusVariant(project.status)} className="gap-1">
                                {getStatusIcon(project.status)}
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {project.description || 'No description provided'}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progress
                            </CardTitle>
                            <Target className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.progress || 0}%</div>
                            <Progress value={project.progress || 0} className="mt-2 h-2" />
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Team Members
                            </CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.users?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active members</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Start Date
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {format(new Date(project.start_date), 'MMM dd, yyyy')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Deadline
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {format(new Date(project.deadline), 'MMM dd, yyyy')}
                            </div>
                            <p className={`text-xs mt-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {isOverdue
                                    ? `${Math.abs(daysUntilDeadline)} days overdue`
                                    : `${daysUntilDeadline} days remaining`}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-gradient-card">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="sprints">Sprints</TabsTrigger>
                        <TabsTrigger value="backlog">
                            Backlog
                            {stats.total > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {stats.total}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Information */}
                            <Card className="bg-gradient-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Project Information</CardTitle>
                                    <CardDescription>General project details and status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Status</p>
                                            <Badge variant={getStatusVariant(project.status)}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Progress</p>
                                            <p className="font-medium">{project.progress || 0}%</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Start Date</p>
                                            <p className="font-medium">
                                                {format(new Date(project.start_date), 'PP')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Deadline</p>
                                            <p className="font-medium">
                                                {format(new Date(project.deadline), 'PP')}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{project.description || 'No description'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-gradient-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest updates and changes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium">Project created</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(project.created_at), 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                        {project.updated_at !== project.created_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-medium">Project updated</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(project.updated_at), 'PPp')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Team Tab */}
                    <TabsContent value="team" className="space-y-6">
                        <Card className="bg-gradient-card border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>
                                            {project.users?.length || 0} member{project.users?.length !== 1 ? 's' : ''} in this project
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {project.users && project.users.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {project.users.map((user: User) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/20">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {user.role.replace(/([A-Z])/g, ' $1').trim()}
                                                    </Badge>
                                                </div>
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

                    {/* Sprints Tab */}
                    <TabsContent value="sprints" className="space-y-6">
                        <Card className="bg-gradient-card border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Sprints</CardTitle>
                                        <CardDescription>Manage project sprints</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground mb-4">No sprints created yet</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Backlog Tab */}
                    <TabsContent value="backlog" className="space-y-6">
                        <Card className="bg-gradient-card border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Product Backlog</CardTitle>
                                        <CardDescription>
                                            {stats.total} user stor{stats.total !== 1 ? 'ies' : 'y'} •
                                            {stats.in_backlog} in backlog •
                                            {stats.in_sprint} in sprint •
                                            {stats.completed} completed
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingBacklog ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                    </div>
                                ) : userStories && userStories.length > 0 ? (
                                    <div className="space-y-3">
                                        {userStories.map((story: {
                                            id: number;
                                            title: string;
                                            description?: string;
                                            priority: string;
                                            status: string;
                                            story_points?: number;
                                            progress?: number;
                                            tasks?: unknown[];
                                        }) => (
                                            <div
                                                key={story.id}
                                                className="group flex items-start gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer border border-transparent hover:border-border/50"
                                                onClick={() => navigate(`/pm/user-stories/${story.id}`)}
                                            >
                                                <GripVertical className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    US-{story.id}
                                                                </Badge>
                                                                <Badge variant={getPriorityVariant(story.priority)}>
                                                                    {story.priority}
                                                                </Badge>
                                                                <Badge variant={getStoryStatusVariant(story.status)}>
                                                                    {story.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium group-hover:text-primary transition-colors">
                                                                {story.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                                {story.description || 'No description'}
                                                            </p>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/pm/user-stories/${story.id}/edit`);
                                                                }}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}>
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <CheckSquare className="h-3 w-3" />
                                                            <span>{story.tasks?.length || 0} tasks</span>
                                                        </div>
                                                        {story.story_points && (
                                                            <div className="flex items-center gap-1">
                                                                <Target className="h-3 w-3" />
                                                                <span>{story.story_points} points</span>
                                                            </div>
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