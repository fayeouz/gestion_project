import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { api } from '@/lib/api';
import { FolderKanban, Users, CheckSquare, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: projects } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => projectService.getAll(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await api.get('/user');
      return response.data.data;
    },
  });

  const stats = [
    {
      title: 'Total Projects',
      value: projects?.length || 0,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      link: '/admin/projects',
    },
    {
      title: 'Total Users',
      value: usersData?.length || 0,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
      link: '/admin/users',
    },
    {
      title: 'Active Projects',
      value: projects?.filter(p => p.status === 'active').length || 0,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/20',
      link: '/admin/projects',
    },
    {
      title: 'Pending Projects',
      value: projects?.filter(p => p.status === 'pending').length || 0,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      link: '/admin/projects',
    },
    {
      title: 'Completed Projects',
      value: projects?.filter(p => p.status === 'completed').length || 0,
      icon: CheckSquare,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      link: '/admin/projects',
    },
  ];

  const roleDistribution = usersData?.reduce((acc: any, user: any) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleDistribution && Object.entries(roleDistribution).map(([role, count]: [string, any]) => (
                <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <span className="font-medium capitalize">
                    {role.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                    >
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.status}
                        </p>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No projects yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/admin/projects')}
          >
            <CardContent className="p-6 text-center space-y-2">
              <FolderKanban className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Manage Projects</h3>
              <p className="text-sm text-muted-foreground">View and manage all projects</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <CardContent className="p-6 text-center space-y-2">
              <Users className="h-8 w-8 mx-auto text-secondary" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage all users</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-card border-border/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/admin/tasks')}
          >
            <CardContent className="p-6 text-center space-y-2">
              <CheckSquare className="h-8 w-8 mx-auto text-success" />
              <h3 className="font-semibold">All Tasks</h3>
              <p className="text-sm text-muted-foreground">Monitor all tasks across projects</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
