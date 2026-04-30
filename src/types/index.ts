export type UserRole = 'student' | 'faculty' | 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  id_number?: string;
  department_id?: string;
  can_edit_curriculum?: boolean;
  program_id?: string;
  is_deleted?: boolean;
  created_at: string;
}

export interface PreauthorizedUser {
  email: string;
  role: UserRole;
  name?: string;
  id_number?: string;
  program_id?: string;
  department_id?: string;
  created_at?: string;
  created_by?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  department_id?: string;
}

export interface CourseNode {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
}

export interface MapEdge {
  id: string;
  source_id: string; // The prerequisite course
  target_id: string; // The course that requires it
  type: 'prerequisite' | 'corequisite' | 'recommended';
}

export interface AuditLogEntry {
  id: string;
  created_at: string;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string;
  target_label?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  // Joined from profiles
  actor_name?: string;
  actor_email?: string;
  actor_role?: UserRole;
}
