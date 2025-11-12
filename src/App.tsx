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
import SMDashboard from "./pages/sm/SMDashboard";
import ManageSprints from "./pages/sm/ManageSprints";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import AdminTasks from "@/pages/admin/AdminTasks.tsx";
import AdminUserStories from "@/pages/admin/AdminUserStories.tsx";
import AdminSprints from "@/pages/admin/AdminSprints.tsx";
import AdminSettings from "@/pages/admin/AdminSettings.tsx";
import MyProjects from "@/pages/pm/MyProjects.tsx";
import ProjectDetails from "@/pages/pm/ProjectDetails.tsx";
import PMAllTasks from "@/pages/pm/PMAllTasks.tsx";
import PMUserStories from "@/pages/pm/PMUserStories.tsx";
import PMBacklogs from "@/pages/pm/PMBacklog.tsx";
import PMTeam from "@/pages/pm/PMTeam.tsx";
import ProjectBacklog from "@/pages/pm/ProjectBacklog.tsx";
import CreateUserStory from "@/pages/pm/CreateUserStory.tsx";
import EditProject from "@/pages/pm/EditProject.tsx";
import UserStoryDetails from "@/pages/pm/UserStoryDetails.tsx";
import EditUserStory from "@/pages/pm/EditUserStory.tsx";
import POProjects from "@/pages/po/POProject.tsx";
import POProjectDetails from "@/pages/po/POProjectDetails.tsx";
import POUserStories from "@/pages/po/POUserStory.tsx";
import POUserStoryDetails from "@/pages/po/POUserStoryDetails.tsx";
import POBacklogs from "@/pages/po/POBacklog.tsx";
import Chat from "@/pages/Chat.tsx";
import SMProjectDetails from "@/pages/sm/SMProjectDetails.tsx";
import SMProjects from "@/pages/sm/SMProject.tsx";
import SMSprint from "@/pages/sm/SMSprint.tsx";
import SMTasks from "@/pages/sm/task.tsx";
import CreateTask from "@/pages/sm/createTask.tsx";
import SMMeetings from "@/pages/sm/SMMeeting.tsx";
import CreateMeeting from "@/pages/sm/CreateMeeting.tsx";
import {LanguageProvider} from "@/contexts/LanguageContext.tsx";
import EditMeeting from "@/pages/sm/EditMeeting.tsx";
import MeetingDetails from "@/pages/sm/MeetingDetails.tsx"; // ✅ UN SEUL IMPORT ICI

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <LanguageProvider>
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
                    <Route
                        path="/admin/tasks"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin']}>
                                    <AdminTasks />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/user-stories"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin']}>
                                    <AdminUserStories />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/sprints"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin']}>
                                    <AdminSprints />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/settings"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin']}>
                                    <AdminSettings />
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
                    <Route path="/pm/chat" element={<Chat />} />
                    <Route
                        path="/pm/projects"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <MyProjects />
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
                    <Route
                        path="/pm/tasks"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <PMAllTasks />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/tasks"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <PMAllTasks />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pm/user-stories"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <PMUserStories />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pm/backlogs"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <PMBacklogs />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pm/team"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <PMTeam />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pm/projects/:id/backlog"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <ProjectBacklog />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/pm/projects/:id/edit"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <EditProject />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pm/user-stories/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager', 'scrumMaster']}>
                                    <UserStoryDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/tasks"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <SMTasks />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="tasks/create"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <CreateTask />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/projects/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <ProjectDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    /><Route
                        path="/pm/projects/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'projectManager']}>
                                    <ProjectDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />


                    {/* Product Owner Routes */}
                    <Route path="/po/chat" element={<Chat />} />
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
                        path="/po/projects"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <POProjects />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/projects/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <POProjectDetails />
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
                    <Route
                        path="/po/user-stories"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <POUserStories />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/user-stories/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <POUserStoryDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/meetings/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <MeetingDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/user-stories/:id/edit"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <EditUserStory/>
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/meetings/:id/edit"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <EditMeeting/>
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/backlogs"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <POBacklogs />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/po/projects/:id/backlog"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'productOwner']}>
                                    <ProjectBacklog />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    {/* Scrum Master Routes */}
                    <Route path="/sm/chat" element={<Chat />} />
                    <Route
                        path="/sm/user-stories"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <PMUserStories />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/projects"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <SMProjects />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/team"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <PMTeam />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/projects/:id"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <SMProjectDetails />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sm/sprints"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <SMSprint />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
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
                    <Route
                        path="/sm/meeting"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <SMMeetings />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="sm/meetings/create"
                        element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={['admin', 'scrumMaster']}>
                                    <CreateMeeting />
                                </RoleGuard>
                            </ProtectedRoute>
                        }
                    />

                    {/* Team Member Routes */}
                    <Route path="chat" element={<Chat />} />
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
        </LanguageProvider>
    </QueryClientProvider>
);

export default App;