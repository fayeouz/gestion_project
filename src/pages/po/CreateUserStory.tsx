import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userStoryService } from '@/services/userStoryService';
import { projectService } from '@/services/projectService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function CreateUserStory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_backlog_id: '',
    status: 'pending',
  });

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<any>) => userStoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stories'] });
      toast.success('User story created successfully!');
      navigate('/po/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user story');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      product_backlog_id: parseInt(formData.product_backlog_id),
    };
    createMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Create User Story</h1>
          <p className="text-muted-foreground">Add a new user story to the product backlog</p>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>User Story Details</CardTitle>
            <CardDescription>
              Define the user story requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="As a user, I want to..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the user story in detail"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backlog">Product Backlog *</Label>
                <Input
                  id="backlog"
                  type="number"
                  placeholder="Enter backlog ID"
                  value={formData.product_backlog_id}
                  onChange={(e) => setFormData({ ...formData, product_backlog_id: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You need to know the product backlog ID from the project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/po/dashboard')}
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
                    'Create User Story'
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
