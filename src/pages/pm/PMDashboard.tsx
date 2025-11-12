import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { FolderKanban, CheckSquare, Users, Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PMDashboard() {
  const navigate = useNavigate();

  const { data: projects } = useQuery({
    queryKey: ['pm-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const stats = [
    {
      title: 'Mes Projets',
      value: projects?.length || 0,
      icon: FolderKanban,
      color: 'text-primary',
    },
    {
      title: 'Actifs',
      value: projects?.filter(p => p.status === 'active').length || 0,
      icon: CheckSquare,
      color: 'text-success',
    },
    {
      title: 'En Attente',
      value: projects?.filter(p => p.status === 'pending').length || 0,
      icon: BookOpen,
      color: 'text-warning',
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord Chef de Projet</h1>
              <p className="text-muted-foreground">Gérez vos projets et équipes</p>
            </div>
            <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/pm/create-project')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-gradient-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
            ))}
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Mes Projets</CardTitle>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                            onClick={() => navigate(`/pm/projects/${project.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg line-clamp-1 text-ellipsis overflow-hidden">
                                {project.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 text-ellipsis overflow-hidden">
                                {project.description || 'Aucune description'}
                              </p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                          </div>

                          {project.progress !== undefined && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progression</span>
                                  <span className="font-medium">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                              </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{project.users?.length || 0} membre{project.users?.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-12">
                    <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucun projet pour le moment</p>
                    <Button
                        className="mt-4 bg-gradient-primary hover:opacity-90"
                        onClick={() => navigate('/pm/create-project')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Créer Votre Premier Projet
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
}