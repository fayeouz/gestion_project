import { authService } from '@/services/authService';
import { User, UserRole } from '@/types';

export function useAuth() {
  const user = authService.getCurrentUser();

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isProjectManager = () => hasRole(['admin', 'projectManager']);
  const isProductOwner = () => hasRole(['admin', 'productOwner']);
  const isScrumMaster = () => hasRole(['admin', 'scrumMaster']);
  const isTeamMember = () => hasRole('teamMember');

  const canCreateProject = () => hasRole(['admin', 'projectManager']);
  const canCreateUserStory = () => hasRole(['admin', 'productOwner']);
  const canManageSprint = () => hasRole(['admin', 'scrumMaster']);
  const canViewAllProjects = () => hasRole(['admin', 'projectManager']);

  return {
    user,
    hasRole,
    isAdmin,
    isProjectManager,
    isProductOwner,
    isScrumMaster,
    isTeamMember,
    canCreateProject,
    canCreateUserStory,
    canManageSprint,
    canViewAllProjects,
  };
}
