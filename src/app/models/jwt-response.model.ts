// src/app/models/jwt-response.model.ts
export interface JwtResponse {
    jwttoken: string;
    authenticated: boolean;
    email: string;
    role: string;
    accessMap: { [key: string]: boolean }; // Adjust as necessary
    username: string; // Add this line
  }
  