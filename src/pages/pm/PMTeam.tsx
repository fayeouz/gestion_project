import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import {
    Users,
    Search,
    UserPlus,
    Mail,
    FolderKanban,
    CheckSquare
} from 'lucide-react';
import { useState } from 'react';
import { User } from '@/types';

export default function PMTeam() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: projects, isLoading } = useQuery({
        queryKey: ['pm-team'],
        queryFn: () => projectService.getMyProjects(),
        refetchOnMount: true,
    });

    // Collecter tous les membres uniques de tous les projets
    const allMembers = projects?.reduce((acc: User[], project) => {
        if (project.users) {
            project.users.forEach(user => {
                // Éviter les doublons
                if (!acc.find(u => u.id === user.id)) {
                    acc.push(user);
                }
            });
        }
        return acc;
    }, []) || [];

    const filteredMembers = allMembers.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-destructive';
            case 'projectManager': return 'bg-primary';
            case 'productOwner': return 'bg-secondary';
            case 'scrumMaster': return 'bg-success';
            case 'teamMember': return 'bg-muted';
            default: return 'bg-muted';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'projectManager': return 'Chef de Projet';
            case 'productOwner': return 'Product Owner';
            case 'scrumMaster': return 'Scrum Master';
            case 'teamMember': return 'Membre d\'Équipe';
            default: return role.replace(/([A-Z])/g, ' $1').trim();
        }
    };

    const getProjectsForMember = (memberId: number) => {
        return projects?.filter(project =>
            project.users?.some(user => user.id === memberId)
        ) || [];
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

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion d'Équipe</h1>
                        <p className="text-muted-foreground">
                            Gérez tous les membres de l'équipe de vos projets
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{allMembers.length}</div>
                            <p className="text-sm text-muted-foreground">Membres totaux</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-primary">{projects?.length || 0}</div>
                            <p className="text-sm text-muted-foreground">Projets actifs</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-success">
                                {allMembers.filter(m => m.role === 'scrumMaster').length}
                            </div>
                            <p className="text-sm text-muted-foreground">Scrum Masters</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-muted-foreground">
                                {allMembers.filter(m => m.role === 'teamMember').length}
                            </div>
                            <p className="text-sm text-muted-foreground">Membres d'équipe</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher des membres d'équipe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members Grid */}
                {filteredMembers && filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map((member) => {
                            const memberProjects = getProjectsForMember(member.id);

                            return (
                                <Card key={member.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarFallback className="bg-primary/20 text-lg">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="truncate">{member.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{member.email}</span>
                                                </CardDescription>
                                                <Badge className={`${getRoleBadgeColor(member.role)} mt-2`}>
                                                    {getRoleLabel(member.role)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                                <FolderKanban className="h-4 w-4 text-primary" />
                                                <div>
                                                    <p className="font-bold">{memberProjects.length}</p>
                                                    <p className="text-xs text-muted-foreground">Projets</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                                                <CheckSquare className="h-4 w-4 text-success" />
                                                <div>
                                                    <p className="font-bold">0</p>
                                                    <p className="text-xs text-muted-foreground">Tâches</p>
                                                </div>
                                            </div>
                                        </div>

                                        {memberProjects.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium mb-2">Projets :</p>
                                                <div className="space-y-1">
                                                    {memberProjects.slice(0, 3).map((project) => (
                                                        <div
                                                            key={project.id}
                                                            className="text-xs p-2 rounded bg-muted/20 truncate"
                                                        >
                                                            {project.name}
                                                        </div>
                                                    ))}
                                                    {memberProjects.length > 3 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            +{memberProjects.length - 3} autre{memberProjects.length - 3 > 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? 'Aucun membre d\'équipe ne correspond à votre recherche'
                                    : 'Aucun membre d\'équipe pour le moment'}
                            </p>
                            {!searchTerm && (
                                <Button className="bg-gradient-primary hover:opacity-90">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Ajouter le premier membre
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}