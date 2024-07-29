// src/app/models/jwt-response.model.ts
export interface JwtResponse {
    token: string;
    authenticated: boolean;
    email: string;
    role: string;
    accessMap: { [key: string]: boolean }; // Adjust as necessary
  }
  