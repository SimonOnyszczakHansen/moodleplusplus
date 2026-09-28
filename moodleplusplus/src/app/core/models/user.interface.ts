export interface LoginResponse {
  jwt?: string;
  accessToken?: string;
  tokenType?: string;
  userId?: string | number;
  id?: string | number;
  isMissingConsents: boolean;
  name?: string;
  role?: string | number;
  email?: string;
  isMissingConsents?: boolean;
}

export interface User {
  id?: string | number | null;
  email?: string;
  name: string;
  role: string | number;
}
