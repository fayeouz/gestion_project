export type UserRole = 'admin' | 'projectManager' | 'productOwner' | 'scrumMaster' | 'teamMember';
export type ProjectStatus = 'pending' | 'active' | 'completed';
export type TaskStatus = 'pending' | 'active' | 'completed';
export type MeetingType = 'daily_standup' | 'sprint_planning' | 'sprint_review' | 'sprint_retrospective';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  deadline: string;
  status: ProjectStatus;
  project_manager_id: number;
  created_at: string;
  updated_at: string;
  users?: User[];
  progress?: number;
}

export interface Sprint {
  id: number;
  number: number;
  start_date: string;
  deadline: string;
  objective: string;
  project_id: number;
  duration_days?: number;
  days_left?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductBacklog {
  id: number;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserStory {
  id: number;
  title: string;
  description: string;
  sprint_id?: number;
  product_backlog_id: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
  progress?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  user_story_id: number;
  assigned_to: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  assignedUser?: User;
  userStory?: UserStory;
}

export interface Increment {
  id: number;
  name: string;
  user_story_id: number;
  image?: string;
  file?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatProject {
  id: number;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  chat_project_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Notification {
  id: number;
  object: string;
  message: string;
  user_id: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  type: MeetingType;
  duration: number; // Duration in minutes
  user_id: number;
  project_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  project?: Project;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  type: MeetingType;
  duration: number;
  user_id: number;
  project_id: number;
}

export interface MeetingStats {
  total_meetings: number;
  by_type: {
    daily_standup: number;
    sprint_planning: number;
    sprint_review: number;
    sprint_retrospective: number;
  };
  total_duration: number;
  average_duration: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TaskStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
}