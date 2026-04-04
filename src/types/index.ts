export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
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
