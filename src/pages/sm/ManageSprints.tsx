import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sprintService } from '@/services/sprintService';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ManageSprints() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    start_date: '',
    deadline: '',
    objective: '',
    project_id: '',
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  // Calculer automatiquement le numéro du sprint
  const getNextSprintNumber = async (projectId: number) => {
    try {
      const sprints = await sprintService.getAll();
      const projectSprints = sprints.filter(s => s.project_id === projectId);
      const sprintCount = projectSprints.length;

      // Si 0 sprint → numéro = 1, sinon nombre de sprints + 1
      return sprintCount === 0 ? 1 : sprintCount + 1;
    } catch (error) {
      console.error('Erreur lors du calcul du numéro de sprint:', error);
      return 1; // Par défaut, retourner 1 en cas d'erreur
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const sprintNumber = await getNextSprintNumber(data.project_id);
      return sprintService.create({
        ...data,
        number: sprintNumber,
      });
    },
    onSuccess: (data) => {
      console.log('Sprint créé avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['all-sprints'] });
      toast.success('Sprint créé avec succès !');
      navigate('/sm/dashboard');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création:', error);
      toast.error(error.response?.data?.message || error.message || 'Échec de la création du sprint');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      project_id: parseInt(formData.project_id),
    };
    createMutation.mutate(data);
  };

  return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Créer un Sprint</h1>
            <p className="text-muted-foreground">Configurer un nouveau cycle de sprint pour votre projet</p>
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Détails du Sprint</CardTitle>
              <CardDescription>
                Configurez les paramètres du sprint (durée de 2 à 4 semaines)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="project">Projet *</Label>
                  {isLoadingProjects ? (
                      <div className="flex items-center justify-center p-3 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Chargement des projets...</span>
                      </div>
                  ) : (
                      <Select
                          value={formData.project_id}
                          onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects && projects.length > 0 ? (
                              projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id.toString()}>
                                    {project.name}
                                  </SelectItem>
                              ))
                          ) : (
                              <SelectItem value="0" disabled>
                                Aucun projet disponible
                              </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objectif du Sprint *</Label>
                  <Textarea
                      id="objective"
                      placeholder="Qu'est-ce que vous voulez accomplir dans ce sprint ?"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      rows={3}
                      required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de Début *</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date de Fin *</Label>
                    <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        required
                    />
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note :</strong> La durée du sprint doit être entre 2 et 4 semaines (14-28 jours) selon les meilleures pratiques Agile. Le numéro du sprint sera attribué automatiquement.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/sm/sprints')}
                      disabled={createMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                      type="submit"
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      disabled={createMutation.isPending || !formData.project_id}
                  >
                    {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                    ) : (
                        'Créer le Sprint'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
}