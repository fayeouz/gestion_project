import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    number: '',
    start_date: '',
    deadline: '',
    objective: '',
    project_id: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sprintService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint created successfully!');
      navigate('/sm/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sprint');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      number: parseInt(formData.number),
      project_id: parseInt(formData.project_id),
    };
    createMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Create Sprint</h1>
          <p className="text-muted-foreground">Set up a new sprint cycle for your project</p>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Sprint Details</CardTitle>
            <CardDescription>
              Configure the sprint parameters (2-4 weeks duration)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Input
                  id="project"
                  type="number"
                  placeholder="Enter project ID"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Sprint Number *</Label>
                <Input
                  id="number"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Sprint Objective *</Label>
                <Textarea
                  id="objective"
                  placeholder="What do you want to achieve in this sprint?"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">End Date *</Label>
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
                  <strong>Note:</strong> Sprint duration must be between 2-4 weeks (14-28 days) as per Agile best practices.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/sm/dashboard')}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Sprint'
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
