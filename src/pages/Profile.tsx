import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/authService';
import { Mail, User as UserIcon, Shield } from 'lucide-react';

export default function Profile() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive';
      case 'projectManager': return 'bg-primary';
      case 'productOwner': return 'bg-secondary';
      case 'scrumMaster': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarFallback className="text-3xl bg-gradient-primary text-white">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
            </div>
            <Badge className={`${getRoleBadgeColor(user.role)} w-fit mx-auto`}>
              {user.role.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-primary/20">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-secondary/20">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-success/20">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="font-medium">#{user.id}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="font-medium">{new Date(user.updated_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
