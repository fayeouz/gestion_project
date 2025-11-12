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
import { fr } from 'date-fns/locale';
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

export default function POProjectDetails() {
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
            toast.success('Projet supprimé avec succès !');
            navigate('/po/projects');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Échec de la suppression du projet');
        }
    });

    // ✅ Mutation pour ajouter un membre
    const addMemberMutation = useMutation({
        mutationFn: (userId: number) => projectService.addUsers(Number(id), [userId]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            toast.success('Membre ajouté avec succès !');
            setShowAddMemberDialog(false);
            setSelectedUserId('');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Échec de l\'ajout du membre');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setShowDeleteDialog(false);
    };

    const handleAddMember = () => {
        if (!selectedUserId) {
            toast.error('Veuillez sélectionner un utilisateur');
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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminé';
            default: return status;
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

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return 'Élevée';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return priority;
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

    const getStoryStatusText = (status: string) => {
        switch (status) {
            case 'backlog': return 'Backlog';
            case 'in_sprint': return 'En sprint';
            case 'completed': return 'Terminée';
            default: return status.replace('_', ' ');
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'projectManager': return 'Chef de Projet';
            case 'productOwner': return 'Product Owner';
            case 'scrumMaster': return 'Scrum Master';
            case 'teamMember': return 'Membre d\'Équipe';
            default: return role.replace(/([A-Z])/g, ' $1').trim();
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
                            <p className="text-muted-foreground">Projet non trouvé</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/po/projects')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux projets
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
                            onClick={() => navigate('/po/projects')}
                            className="mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux projets
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <Badge variant={getStatusVariant(project.status)} className="gap-1">
                                {getStatusIcon(project.status)}
                                {getStatusText(project.status)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {project.description || 'Aucune description fournie'}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progression
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
                                Membres d'équipe
                            </CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.users?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Date de début
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Échéance
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <p className={`text-xs mt-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {isOverdue
                                    ? `En retard de ${Math.abs(daysUntilDeadline)} jour${Math.abs(daysUntilDeadline) > 1 ? 's' : ''}`
                                    : `${daysUntilDeadline} jour${daysUntilDeadline > 1 ? 's' : ''} restant${daysUntilDeadline > 1 ? 's' : ''}`}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-gradient-card">
                        <TabsTrigger value="overview">Aperçu</TabsTrigger>
                        <TabsTrigger value="team">Équipe</TabsTrigger>
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
                                    <CardTitle>Informations du projet</CardTitle>
                                    <CardDescription>Détails généraux et statut du projet</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Statut</p>
                                            <Badge variant={getStatusVariant(project.status)}>
                                                {getStatusText(project.status)}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Progression</p>
                                            <p className="font-medium">{project.progress || 0}%</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Date de début</p>
                                            <p className="font-medium">
                                                {format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Échéance</p>
                                            <p className="font-medium">
                                                {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{project.description || 'Aucune description'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-gradient-card border-border/50">
                                <CardHeader>
                                    <CardTitle>Activité récente</CardTitle>
                                    <CardDescription>Dernières mises à jour et modifications</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium">Projet créé</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(project.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        {project.updated_at !== project.created_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-medium">Projet mis à jour</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(project.updated_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
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
                                        <CardTitle>Membres de l'équipe</CardTitle>
                                        <CardDescription>
                                            {project.users?.length || 0} membre{project.users?.length > 1 ? 's' : ''} dans ce projet
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
                                                        {getRoleText(user.role)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">Aucun membre d'équipe pour le moment</p>
                                        <Button onClick={() => setShowAddMemberDialog(true)}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Ajouter le premier membre
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
                                        <CardDescription>Gérez les sprints du projet</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground mb-4">Aucun sprint créé pour le moment</p>
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
                                        <CardTitle>Backlog Produit</CardTitle>
                                        <CardDescription>
                                            {stats.total} user stor{stats.total > 1 ? 'ies' : 'y'} •
                                            {stats.in_backlog} en backlog •
                                            {stats.in_sprint} en sprint •
                                            {stats.completed} terminée{stats.completed > 1 ? 's' : ''}
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => navigate('/po/create-story')}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Nouvelle User Story
                                    </Button>
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
                                                onClick={() => navigate(`/po/user-stories/${story.id}`)}
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
                                                                    {getPriorityText(story.priority)}
                                                                </Badge>
                                                                <Badge variant={getStoryStatusVariant(story.status)}>
                                                                    {getStoryStatusText(story.status)}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium group-hover:text-primary transition-colors">
                                                                {story.title}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                                {story.description || 'Aucune description'}
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
                                                                    navigate(`/po/user-stories/${story.id}/edit`);
                                                                }}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Modifier
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}>
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <CheckSquare className="h-3 w-3" />
                                                            <span>{story.tasks?.length || 0} tâche{story.tasks?.length > 1 ? 's' : ''}</span>
                                                        </div>
                                                        {story.story_points && (
                                                            <div className="flex items-center gap-1">
                                                                <Target className="h-3 w-3" />
                                                                <span>{story.story_points} point{story.story_points > 1 ? 's' : ''}</span>
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
                                        <p className="text-muted-foreground mb-4">Aucune user story pour le moment</p>
                                        <Button onClick={() => navigate('/po/create-story')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Créer la première User Story
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
                                Supprimer le projet ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer <strong>{project.name}</strong> ?
                                Cette action ne peut pas être annulée. Toutes les user stories, sprints,
                                et tâches associées seront définitivement supprimées.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer le projet'}
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
                            <DialogTitle>Ajouter un membre d'équipe</DialogTitle>
                            <DialogDescription>
                                Recherchez et sélectionnez un utilisateur à ajouter à ce projet
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par nom ou email..."
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
                                                        {getRoleText(user.role)}
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
                                        Tous les utilisateurs sont déjà membres de ce projet
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Aucun utilisateur trouvé pour "{searchQuery}"
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
                                Annuler
                            </Button>
                            <Button
                                onClick={handleAddMember}
                                disabled={!selectedUserId || addMemberMutation.isPending}
                            >
                                {addMemberMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Ajout...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Ajouter le membre
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