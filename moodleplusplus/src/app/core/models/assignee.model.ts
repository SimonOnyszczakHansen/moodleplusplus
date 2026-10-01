export type AssigneeType = 'student' | 'group';

export interface IAssignee {
  id: string;
  name: string;
  type: AssigneeType;
}
