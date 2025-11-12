import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, CheckSquare, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PODashboard() {
  const navigate = useNavigate();

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord Product Owner</h1>
              <p className="text-muted-foreground">Gérez les user stories et les backlogs produit</p>
            </div>
            <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/po/create-story')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle User Story
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
                className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
                onClick={() => navigate('/po/user-stories')}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">User Stories</h3>
                <p className="text-sm text-muted-foreground">Créez et gérez les user stories</p>
              </CardContent>
            </Card>

            <Card
                className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
                onClick={() => navigate('/po/backlogs')}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="p-3 rounded-lg bg-secondary/20 w-fit mx-auto">
                  <Layers className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Backlogs Produit</h3>
                <p className="text-sm text-muted-foreground">Gérez les backlogs produit</p>
              </CardContent>
            </Card>

            <Card
                className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
                onClick={() => navigate('/po/tasks')}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="p-3 rounded-lg bg-success/20 w-fit mx-auto">
                  <CheckSquare className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-semibold text-lg">Mes Tâches</h3>
                <p className="text-sm text-muted-foreground">Voir mes tâches assignées</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                  variant="outline"
                  className="h-20 justify-start"
                  onClick={() => navigate('/po/create-story')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Créer une User Story</div>
                    <div className="text-xs text-muted-foreground">Ajouter une nouvelle story au backlog</div>
                  </div>
                </div>
              </Button>

              <Button
                  variant="outline"
                  className="h-20 justify-start"
                  onClick={() => navigate('/po/projects')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Layers className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Voir les Projets</div>
                    <div className="text-xs text-muted-foreground">Voir tous les projets actifs</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
}