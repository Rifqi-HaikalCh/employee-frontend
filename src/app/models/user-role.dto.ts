export interface UserRoleDto {
    id: number;
    username: string;
    roles: {
      user: boolean;
      superAdmin: boolean;
      staffAdmin: boolean;
      controlAdmin: boolean;
    };
  }
  