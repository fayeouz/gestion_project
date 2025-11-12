import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { projectService } from '@/services/projectService';
import { api } from '@/lib/api';
import { FolderKanban, Users, CheckSquare, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Charger les stats principales
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Précharger les données pour les pages liées dès que le dashboard est monté
  useEffect(() => {
    // Précharger tous les projets (pour la page /admin/projects)
    queryClient.prefetchQuery({
      queryKey: ['all-projects'],
      queryFn: () => projectService.getAll(),
      staleTime: 5 * 60 * 1000,
    });

    // Précharger tous les utilisateurs (pour la page /admin/users)
    queryClient.prefetchQuery({
      queryKey: ['all-users'],
      queryFn: async () => {
        const response = await api.get('/user');
        if (!response.data) return [];
        if (Array.isArray(response.data)) return response.data;
        return response.data.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const stats = dashboardStats ? [
    {
      title: 'Projets Totaux',
      value: dashboardStats.projects.total,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      link: '/admin/projects',
    },
    {
      title: 'Utilisateurs Totaux',
      value: dashboardStats.users.total,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
      link: '/admin/users',
    },
    {
      title: 'Projets Actifs',
      value: dashboardStats.projects.active,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/20',
      link: '/admin/projects',
    },
    {
      title: 'Projets En Attente',
      value: dashboardStats.projects.pending,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      link: '/admin/projects',
    },
    {
      title: 'Projets Terminés',
      value: dashboardStats.projects.completed,
      icon: CheckSquare,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      link: '/admin/projects',
    },
  ] : [];

  if (isLoading) {
    return (
        <Layout>
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
              <p className="text-muted-foreground">Chargement des données du tableau de bord...</p>
            </div>
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
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
            <p className="text-muted-foreground">Vue d'ensemble complète du système et gestion</p>
          </div>

          {/* Cartes de Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
                    onClick={() => navigate(stat.link)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Répartition des Utilisateurs & Projets Récents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Répartition des Utilisateurs par Rôle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardStats && Object.keys(dashboardStats.users.roleDistribution).length > 0 ? (
                    Object.entries(dashboardStats.users.roleDistribution).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <span className="font-medium capitalize">
                      {role.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                          <span className="text-2xl font-bold">{count as React.ReactNode}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur pour le moment
                    </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Projets Récents</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardStats && dashboardStats.projects.recent.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.projects.recent.map((project: any) => (
                          <div
                              key={project.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => navigate(`/admin/projects/${project.id}`)}
                          >
                            <div>
                              <h3 className="font-medium">{project.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {project.status}
                              </p>
                            </div>
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun projet pour le moment
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
                className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/admin/projects')}
            >
              <CardContent className="p-6 text-center space-y-2">
                <FolderKanban className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-semibold">Gérer les Projets</h3>
                <p className="text-sm text-muted-foreground">Voir et gérer tous les projets</p>
              </CardContent>
            </Card>

            <Card
                className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/admin/users')}
            >
              <CardContent className="p-6 text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-secondary" />
                <h3 className="font-semibold">Gérer les Utilisateurs</h3>
                <p className="text-sm text-muted-foreground">Voir et gérer tous les utilisateurs</p>
              </CardContent>
            </Card>

            <Card
                className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/admin/tasks')}
            >
              <CardContent className="p-6 text-center space-y-2">
                <CheckSquare className="h-8 w-8 mx-auto text-success" />
                <h3 className="font-semibold">Toutes les Tâches</h3>
                <p className="text-sm text-muted-foreground">Surveiller toutes les tâches des projets</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
  );
}