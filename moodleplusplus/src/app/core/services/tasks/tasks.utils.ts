import {
  ITaskAssignmentDetail,
  ITaskAssignmentSummary,
  ITaskAssignmentRow,
  ITeacherTaskDetail,
  IApiTaskAssignment,
  IApiAssignmentRow,
  IApiTeacherTaskDetail,
  IApiUser,
  mapAssignmentStatus,
} from '../../models/tasks.model';
import { IAssignee } from '../../models/assignee.model';
import { IApiGroup } from '../../models/group.model';

export function mapApiGroupToAssignee(api: IApiGroup): IAssignee {
  return { id: api.id, name: api.name, type: 'group' };
}

export function mapApiUserToAssignee(api: IApiUser): IAssignee {
  return { id: String(api.id), name: api.name, type: 'student' };
}

export function mapApiAssignment(api: IApiTaskAssignment): ITaskAssignmentSummary {
  return {
    assignmentId: api.assignmentId,
    taskId: api.task.id,
    title: api.task.title,
    deadline: api.deadline,
    status: mapAssignmentStatus(api.status),
    groupId: api.recipientType === 'group' ? api.recipientId : undefined,
    groupName: api.recipientType === 'group' ? api.recipientName : undefined,
  };
}

export function mapApiAssignmentDetail(api: IApiTaskAssignment): ITaskAssignmentDetail {
  return {
    ...mapApiAssignment(api),
    description: api.task.description,
    submission: null,
    feedback: [],
    objectives: [],
  };
}

export function mapApiAssignmentRow(api: IApiAssignmentRow): ITaskAssignmentRow {
  return {
    assignmentId: api.assignmentId,
    studentId: api.recipientType === 'student' ? api.recipientId : undefined,
    studentName: api.recipientType === 'student' ? api.recipientName : undefined,
    groupId: api.recipientType === 'group' ? api.recipientId : undefined,
    groupName: api.recipientType === 'group' ? api.recipientName : undefined,
    status: mapAssignmentStatus(api.status),
    submission: null,
    feedback: [],
  };
}

export function mapApiTeacherTaskDetail(api: IApiTeacherTaskDetail): ITeacherTaskDetail {
  return {
    ...api.task,
    objectives: api.objectives,
    assignments: api.assignments.map(mapApiAssignmentRow),
  };
}
