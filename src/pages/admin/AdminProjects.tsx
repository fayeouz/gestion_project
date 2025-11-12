import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { FolderKanban, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from "react-router-dom";

export default function AdminProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => projectService.getAll(),
  });

  const navigate = useNavigate();

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

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Tous les Projets</h1>
            <p className="text-muted-foreground">Vue d'ensemble des projets du système</p>
          </div>

          {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
          ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant={getStatusVariant(project.status)} className="flex-shrink-0">
                            {getStatusText(project.status)}
                          </Badge>
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
                            <span>{format(new Date(project.deadline), 'dd MMM')}</span>
                          </div>
                          {project.users && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{project.users.length} membre{project.users.length > 1 ? 's' : ''}</span>
                              </div>
                          )}
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/projects/${project.id}`)}>
                          Voir les détails
                        </Button>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucun projet dans le système
                </CardContent>
              </Card>
          )}
        </div>
      </Layout>
  );
}