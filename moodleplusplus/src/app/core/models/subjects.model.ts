export interface ISubject {
  id: string | number;
  name: string;
  createdAt?: string;
  created_at?: string;
  createdBy?: string | number;
  created_by?: string | number;
  isSoftDeleted?: boolean;
  is_soft_deleted?: boolean;
  deletedAt?: string | null;
  deleted_at?: string | null;
}

export interface ISubjectGoal {
  id: string | number;
  subjectId: string | number;
  subject_id?: string | number;
  content: string;
  isSoftDeleted?: boolean;
  is_soft_deleted?: boolean;
  deletedAt?: string | null;
  deleted_at?: string | null;
}

export interface ITeacherSubject {
  teacherId: string | number;
  teacher_id?: string | number;
  subjectId: string | number;
  subject_id?: string | number;
  assignedAt?: string;
  assigned_at?: string;
}

export interface ISubjectTeacher {
  id?: string | number;
  Id?: string | number;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
}

export interface ICreateSubjectRequest {
  name: string;
}

export interface IEditSubjectRequest {
  name: string;
}

export interface ICreateGoalRequest {
  subjectId: string;
  content: string;
}

export interface IEditGoalRequest {
  content: string;
}

export interface ISubjectGoalRow extends ISubjectGoal {
  index: number;
}
