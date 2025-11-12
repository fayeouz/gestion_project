import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Plus, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Projects() {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      default: return 'outline';
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

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projets</h1>
              <p className="text-muted-foreground">Gérez et suivez tous vos projets</p>
            </div>
            <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/projects/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>

          {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
          ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer group"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {project.name}
                          </CardTitle>
                          <Badge variant={getStatusVariant(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.description || 'Aucune description fournie'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progression</span>
                                <span className="font-medium">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                        {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}
                      </span>
                          </div>
                          {project.users && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{project.users.length} membres</span>
                              </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun projet pour le moment</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre premier projet pour commencer
                  </p>
                  <Button
                      className="bg-gradient-primary hover:opacity-90"
                      onClick={() => navigate('/projects/new')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un Projet
                  </Button>
                </CardContent>
              </Card>
          )}
        </div>
      </Layout>
  );
}