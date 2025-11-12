import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function Tasks() {
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskService.getMyTasks(),
  });

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

  const completionRate = tasksData?.stats
      ? Math.round((tasksData.stats.completed / tasksData.stats.total) * 100)
      : 0;

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Mes Tâches</h1>
            <p className="text-muted-foreground">Suivez et gérez vos tâches assignées</p>
          </div>

          {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
          ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{tasksData?.stats?.total || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-warning">{tasksData?.stats?.pending || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Actives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-secondary">{tasksData?.stats?.active || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Terminées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success">{tasksData?.stats?.completed || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle>Taux d'Achèvement</CardTitle>
                    <CardDescription>Votre progression globale dans l'achèvement des tâches</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={completionRate} className="h-3" />
                    <p className="text-sm text-muted-foreground">{completionRate}% des tâches terminées</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {tasksData?.tasks && tasksData.tasks.length > 0 ? (
                      tasksData.tasks.map((task) => (
                          <Card key={task.id} className="bg-gradient-card border-border/50 hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <CardTitle className="text-lg">{task.title}</CardTitle>
                                  <CardDescription>{task.description}</CardDescription>
                                </div>
                                <Badge className={getStatusColor(task.status)}>
                                  {getStatusLabel(task.status)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {task.assignedUser && (
                                      <>
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="text-sm bg-primary/20">
                                            {task.assignedUser.name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{task.assignedUser.name}</p>
                                          <p className="text-xs text-muted-foreground">{task.assignedUser.role}</p>
                                        </div>
                                      </>
                                  )}
                                </div>
                                <Badge variant="outline">#{task.id}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                      ))
                  ) : (
                      <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                          <p className="text-muted-foreground">Aucune tâche assignée pour le moment</p>
                        </CardContent>
                      </Card>
                  )}
                </div>
              </>
          )}
        </div>
      </Layout>
  );
}