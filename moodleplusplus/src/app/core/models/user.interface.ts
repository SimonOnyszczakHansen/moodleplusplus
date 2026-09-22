// 1. Structure for the JWT response from Spring Boot
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

// 2. Structure for the full user profile data
export interface User {
  email: string;
  name: string;
  role: string;
}
