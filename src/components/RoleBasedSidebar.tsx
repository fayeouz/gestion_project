import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Layers, 
  Users, 
  BookOpen, 
  Calendar,
  Settings,
  FileText
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

  // Menu items based on role
  const getMenuItems = () => {
    if (isAdmin()) {
      return [
        { title: 'Admin Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'All Projects', url: '/admin/projects', icon: FolderKanban },
        { title: 'All Users', url: '/admin/users', icon: Users },
        { title: 'All Tasks', url: '/admin/tasks', icon: CheckSquare },
        { title: 'User Stories', url: '/admin/user-stories', icon: BookOpen },
        { title: 'Sprints', url: '/admin/sprints', icon: Calendar },
        { title: 'Settings', url: '/admin/settings', icon: Settings },
      ];
    }

    if (isProjectManager()) {
      return [
        { title: 'PM Dashboard', url: '/pm/dashboard', icon: LayoutDashboard },
        { title: 'My Projects', url: '/pm/projects', icon: FolderKanban },
        { title: 'Create Project', url: '/pm/create-project', icon: Layers },
        { title: 'All Tasks', url: '/pm/tasks', icon: CheckSquare },
        { title: 'User Stories', url: '/pm/user-stories', icon: BookOpen },
        { title: 'Backlogs', url: '/pm/backlogs', icon: FileText },
        { title: 'Team', url: '/pm/team', icon: Users },
      ];
    }

    if (isProductOwner()) {
      return [
        { title: 'PO Dashboard', url: '/po/dashboard', icon: LayoutDashboard },
        { title: 'Projects', url: '/po/projects', icon: FolderKanban },
        { title: 'User Stories', url: '/po/user-stories', icon: BookOpen },
        { title: 'Create Story', url: '/po/create-story', icon: FileText },
        { title: 'Backlogs', url: '/po/backlogs', icon: Layers },
        { title: 'My Tasks', url: '/po/tasks', icon: CheckSquare },
      ];
    }

    if (isScrumMaster()) {
      return [
        { title: 'SM Dashboard', url: '/sm/dashboard', icon: LayoutDashboard },
        { title: 'Projects', url: '/sm/projects', icon: FolderKanban },
        { title: 'Sprints', url: '/sm/sprints', icon: Calendar },
        { title: 'Manage Sprints', url: '/sm/manage-sprints', icon: Layers },
        { title: 'User Stories', url: '/sm/user-stories', icon: BookOpen },
        { title: 'Tasks', url: '/sm/tasks', icon: CheckSquare },
        { title: 'Team', url: '/sm/team', icon: Users },
      ];
    }

    // Team Member
    return [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'My Projects', url: '/projects', icon: FolderKanban },
      { title: 'My Tasks', url: '/tasks', icon: CheckSquare },
      { title: 'Kanban Board', url: '/kanban', icon: Layers },
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
              <h1 className="font-bold text-lg">ProjectFlow</h1>
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
