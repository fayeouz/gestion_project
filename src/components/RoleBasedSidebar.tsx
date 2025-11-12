import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Layers,
  Users,
  BookOpen,
  Calendar,
  Settings,
  FileText,
  MessageSquare, Video
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

export function RoleBasedSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const { isAdmin, isProjectManager, isProductOwner, isScrumMaster, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Éléments de menu basés sur le rôle
  const getMenuItems = () => {
    if (isAdmin()) {
      return [
        { title: 'Tableau de Bord Admin', url: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Tous les Projets', url: '/admin/projects', icon: FolderKanban },
        { title: 'Tous les Utilisateurs', url: '/admin/users', icon: Users },
        { title: 'Toutes les Tâches', url: '/admin/tasks', icon: CheckSquare },
        { title: 'User Story', url: '/admin/user-stories', icon: BookOpen },
        { title: 'Sprints', url: '/admin/sprints', icon: Calendar },
        /*{ title: 'Paramètres', url: '/admin/settings', icon: Settings }*/
      ];
    }

    if (isProjectManager()) {
      return [
        { title: 'Tableau de Bord CP', url: '/pm/dashboard', icon: LayoutDashboard },
        { title: 'Mes Projets', url: '/pm/projects', icon: FolderKanban },
        { title: 'Créer un Projet', url: '/pm/create-project', icon: Layers },
        { title: 'Toutes les Tâches', url: '/pm/tasks', icon: CheckSquare },
        { title: 'User Story', url: '/pm/user-stories', icon: BookOpen },
        { title: 'Backlogs', url: '/pm/backlogs', icon: FileText },
        { title: 'Équipe', url: '/pm/team', icon: Users },
        { title: 'Chat', url: '/pm/chat', icon: MessageSquare },
      ];
    }

    if (isProductOwner()) {
      return [
        { title: 'Tableau de Bord PO', url: '/po/dashboard', icon: LayoutDashboard },
        { title: 'Projets', url: '/po/projects', icon: FolderKanban },
        { title: 'User Story', url: '/po/user-stories', icon: BookOpen },
        { title: 'Créer une Histoire', url: '/po/create-story', icon: FileText },
        { title: 'Backlogs', url: '/po/backlogs', icon: Layers },
        { title: 'Mes Tâches', url: '/po/tasks', icon: CheckSquare },
        { title: 'Chat', url: '/po/chat', icon: MessageSquare },
      ];
    }

    if (isScrumMaster()) {
      return [
        { title: 'Tableau de Bord SM', url: '/sm/dashboard', icon: LayoutDashboard },
        { title: 'Projets', url: '/sm/projects', icon: FolderKanban },
        { title: 'Sprints', url: '/sm/sprints', icon: Calendar },
        { title: 'Gérer les Sprints', url: '/sm/manage-sprints', icon: Layers },
        { title: 'User Story', url: '/sm/user-stories', icon: BookOpen },
        { title: 'Tâches', url: '/sm/tasks', icon: CheckSquare },
        { title: 'Équipe', url: '/sm/team', icon: Users },
        { title: 'Chat', url: '/sm/chat', icon: MessageSquare },
        { title: 'Réunion', url: '/sm/meeting', icon: Video },
      ];
    }

    // Membre d'équipe
    return [
      { title: 'Tableau de Bord', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Mes Projets', url: '/projects', icon: FolderKanban },
      { title: 'Mes Tâches', url: '/tasks', icon: CheckSquare },
      { title: 'Tableau Kanban', url: '/kanban', icon: Layers },
      { title: 'Chat', url: '/chat', icon: MessageSquare },
    ];
  };

  const menuItems = getMenuItems();

  return (
      <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
        <SidebarContent>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
                <div>
                  <h1 className="font-bold text-lg">SOFTWEB</h1>
                  <p className="text-xs text-muted-foreground">
                    {user?.role.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
            )}
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url}>
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
  );
}