export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: number | string;
  createdAt: string;
  isMissingConsents: boolean;
}