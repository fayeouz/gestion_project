import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import {
    FolderKanban,
    Users,
    Calendar,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function MyProjects() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: projects, isLoading } = useQuery({
        queryKey: ['pm-projects'],
        queryFn: () => projectService.getMyProjects(),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
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

    // Filtrage des projets
    const filteredProjects = projects?.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mes Projets</h1>
                        <p className="text-muted-foreground">
                            Gérez et suivez tous vos projets
                        </p>
                    </div>
                    <Button
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={() => navigate('/pm/create-project')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Projet
                    </Button>
                </div>

                {/* Filters */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un projet..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="completed">Terminé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                {filteredProjects && filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                className="bg-gradient-card border-border/50 hover:shadow-glow transition-all group"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge variant={getStatusVariant(project.status)} className="flex-shrink-0">
                                            {getStatusText(project.status)}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/pm/projects/${project.id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir les détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`/pm/projects/${project.id}/edit`)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FolderKanban className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base leading-tight line-clamp-1 text-ellipsis overflow-hidden break-words">
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 text-ellipsis overflow-hidden mt-1">
                                                {project.description || 'Aucune description fournie'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Progress */}
                                    {project.progress !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progression</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <Progress value={project.progress} className="h-2" />
                                        </div>
                                    )}

                                    {/* Project Info */}
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Échéance: {format(new Date(project.deadline), 'dd MMM yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>{project.users?.length || 0} membre{project.users?.length > 1 ? 's' : ''} d'équipe</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/pm/projects/${project.id}`)}
                                    >
                                        Voir le projet
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Aucun projet ne correspond à vos filtres'
                                    : 'Aucun projet pour le moment'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button
                                    className="bg-gradient-primary hover:opacity-90"
                                    onClick={() => navigate('/pm/create-project')}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer votre premier projet
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Summary */}
                {projects && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-card border-border/50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{projects.length}</div>
                                <p className="text-sm text-muted-foreground">Projets totaux</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-card border-border/50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-success">
                                    {projects.filter(p => p.status === 'active').length}
                                </div>
                                <p className="text-sm text-muted-foreground">Actifs</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-card border-border/50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-warning">
                                    {projects.filter(p => p.status === 'pending').length}
                                </div>
                                <p className="text-sm text-muted-foreground">En attente</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-card border-border/50">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-muted-foreground">
                                    {projects.filter(p => p.status === 'completed').length}
                                </div>
                                <p className="text-sm text-muted-foreground">Terminés</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
}