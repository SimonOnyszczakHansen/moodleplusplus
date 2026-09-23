export interface LoginResponse {
  jwt?: string;
  accessToken?: string;
  tokenType?: string;
  userId?: string | number;
  id?: string | number;
  name?: string;
  role?: string;
  email?: string;
}

export interface User {
  id?: string | number | null;
  email?: string;
  name: string;
  role: string;
}

export interface ConsentRequest {
  type: string;
  version: string;
  accepted: boolean;
}

export interface ConsentResponse {
  type?: string;
  version?: string;
  acceptedAt?: string;
  accepted?: boolean;
}
