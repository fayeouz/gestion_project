import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export default function AdminUsers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'developer',
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await api.get('/user');

      if (!response.data) {
        return [];
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await api.post('/user', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Utilisateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Échec de la création de l\'utilisateur');
    },
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      const response = await api.put(`/user/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success('Utilisateur mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Échec de la mise à jour de l\'utilisateur');
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/user/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Échec de la suppression de l\'utilisateur');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'developer',
    });
  };

  const handleAddUser = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      const updateData: Partial<UserFormData> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      // N'inclure le mot de passe que s'il est renseigné
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive';
      case 'projectManager': return 'bg-primary';
      case 'productOwner': return 'bg-secondary';
      case 'scrumMaster': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'projectManager': return 'Chef de Projet';
      case 'productOwner': return 'Product Owner';
      case 'scrumMaster': return 'Scrum Master';
      case 'developer': return 'Développeur';
      default: return role.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'projectManager', label: 'Chef de Projet' },
    { value: 'productOwner', label: 'Product Owner' },
    { value: 'scrumMaster', label: 'Scrum Master' },
    { value: 'developer', label: 'Développeur' },
  ];

  return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tous les Utilisateurs</h1>
              <p className="text-muted-foreground">Gérer les utilisateurs du système</p>
            </div>
            <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={handleAddUser}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Utilisateur
            </Button>
          </div>

          {/* Users Grid */}
          {isLoading && !users ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
          ) : users && users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="bg-gradient-card border-border/50 hover:shadow-md transition-all">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/20">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1 text-ellipsis overflow-hidden">
                              {user.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-1 text-ellipsis overflow-hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>

                        <div className="flex gap-2 pt-2">
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            Modifier
                          </Button>
                          <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </CardContent>
              </Card>
          )}

          {/* Add User Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Utilisateur</DialogTitle>
                <DialogDescription>
                  Créer un nouveau compte utilisateur. Tous les champs sont obligatoires.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitCreate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                      type="submit"
                      disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? 'Création...' : 'Créer l\'Utilisateur'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l'Utilisateur</DialogTitle>
                <DialogDescription>
                  Mettre à jour les informations de l'utilisateur. Laissez le mot de passe vide pour conserver le mot de passe actuel.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitUpdate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nom</Label>
                    <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Mot de passe (optionnel)</Label>
                    <Input
                        id="edit-password"
                        type="password"
                        placeholder="Laissez vide pour conserver l'actuel"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Rôle</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                      type="submit"
                      disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera définitivement l'utilisateur "{selectedUser?.name}".
                  Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
                    disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Layout>
  );
}