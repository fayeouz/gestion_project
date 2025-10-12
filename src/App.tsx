import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Kanban from "./pages/Kanban";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import PMDashboard from "./pages/pm/PMDashboard";
import CreateProject from "./pages/pm/CreateProject";
import PODashboard from "./pages/po/PODashboard";
import CreateUserStory from "./pages/po/CreateUserStory";
import SMDashboard from "./pages/sm/SMDashboard";
import ManageSprints from "./pages/sm/ManageSprints";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminProjects />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminUsers />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Project Manager Routes */}
          <Route
            path="/pm/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                  <PMDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pm/create-project"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                  <CreateProject />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Product Owner Routes */}
          <Route
            path="/po/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                  <PODashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/po/create-story"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                  <CreateUserStory />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Scrum Master Routes */}
          <Route
            path="/sm/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                  <SMDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sm/manage-sprints"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                  <ManageSprints />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Team Member Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Kanban />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
