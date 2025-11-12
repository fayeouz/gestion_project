import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth.ts";

export default function CreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Récupérer l'utilisateur connecté

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    deadline: '',
    project_manager_id: 0, // Sera défini avec l'ID de l'utilisateur
  });

  // Définir l'ID du project manager au chargement
  useEffect(() => {
    if (user?.id) {
      // Vérifier que l'utilisateur connecté est bien un Project Manager
      if (user.role !== 'projectManager') {
        toast.error('Seuls les Chefs de Projet peuvent créer des projets');
        navigate('/');
        return;
      }
      setFormData(prev => ({ ...prev, project_manager_id: user.id }));
    }
  }, [user, navigate]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      toast.success('Projet créé avec succès !');
      navigate('/pm/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Échec de la création du projet');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation supplémentaire
    if (!formData.project_manager_id) {
      toast.error('Informations utilisateur manquantes. Veuillez vous reconnecter.');
      return;
    }

    // Vérifier que la deadline est après la date de début
    if (new Date(formData.deadline) <= new Date(formData.start_date)) {
      toast.error('La date d\'échéance doit être après la date de début');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Créer un Nouveau Projet</h1>
            <p className="text-muted-foreground">Configurez un nouveau projet pour votre équipe</p>
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Détails du Projet</CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous pour créer un nouveau projet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du Projet *</Label>
                  <Input
                      id="name"
                      placeholder="Entrez le nom du projet"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                      id="description"
                      placeholder="Décrivez votre projet"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
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
                    <Label htmlFor="deadline">Date d'Échéance *</Label>
                    <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        min={formData.start_date}
                        required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/pm/dashboard')}
                      disabled={createMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                      type="submit"
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                    ) : (
                        'Créer le Projet'
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