import { Role } from './role.enum'; 

export interface User {
  id?: string;
  username: string;
  email: string;
  role: string;
  password?: string; // Assuming you may not always need the password on the frontend
}

