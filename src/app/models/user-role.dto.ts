import { Role } from '../models/role.enum'; // Ensure the path is correct

export interface UserRoleDto {
  id: number;
  username: string;
  roles: {
    [Role.USER]: boolean;
    [Role.SUPER_ADMIN]: boolean;
    [Role.STAFF_ADMIN]: boolean;
    [Role.CONTROL_ADMIN]: boolean;
  };
}

export interface RoleFeature {
  role: string;
  features: { name: string; enabled: boolean }[];
}