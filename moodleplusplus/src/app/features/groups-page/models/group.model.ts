export interface Group {
  id: string;
  name: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  name: string;
  addedAt: string;
}

export interface GroupDetails extends Group {
  students: GroupMember[];
}

export interface GroupStudent {
  id: string;
  name: string;
  email: string;
  role: string | number;
}
