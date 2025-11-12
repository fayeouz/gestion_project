import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { FolderKanban, CheckSquare, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError
  } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskService.getMyTasks(),
  });

  // Statistiques calculées
  const stats = [
    {
      title: 'Projets Actifs',
      value: projects?.filter(p => p.status === 'active').length || 0,
      icon: FolderKanban,
      color: 'text-primary',
      description: 'Projets en cours'
    },
    {
      title: 'Mes Tâches',
      value: tasksData?.stats?.total || 0,
      icon: CheckSquare,
      color: 'text-secondary',
      description: 'Total des tâches'
    },
    {
      title: 'En Attente',
      value: tasksData?.stats?.pending || 0,
      icon: Clock,
      color: 'text-warning',
      description: 'Tâches en attente'
    },
    {
      title: 'Terminées',
      value: tasksData?.stats?.completed || 0,
      icon: TrendingUp,
      color: 'text-success',
      description: 'Tâches complétées'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'completed': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  if (projectsError || tasksError) {
    return (
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
              <p className="text-muted-foreground mb-4">
                Impossible de charger les données du dashboard
              </p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord</h1>
            <p className="text-muted-foreground">Bon retour ! Voici ce qui se passe.</p>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projets récents */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projets Récents</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                      ))}
                    </div>
                ) : projects && projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => (
                          <div
                              key={project.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <div className="flex-1">
                              <h3 className="font-medium">{project.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {project.description || 'Aucune description'}
                              </p>
                              {project.progress !== undefined && (
                                  <div className="mt-2">
                                    <Progress value={project.progress} className="h-1" />
                                  </div>
                              )}
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusLabel(project.status)}
                            </Badge>
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

            {/* Tâches récentes */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes Tâches Récentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                      ))}
                    </div>
                ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasksData.tasks.slice(0, 5).map((task) => (
                          <div
                              key={task.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => navigate(`/tasks/${task.id}`)}
                          >
                            <div className="flex-1">
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {task.description || 'Aucune description'}
                              </p>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune tâche assignée
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
  );
}