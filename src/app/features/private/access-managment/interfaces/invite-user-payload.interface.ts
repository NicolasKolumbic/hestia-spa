import { PermissionDto } from "./permission-dto";

export interface InviteUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  permissions: PermissionDto[];
}
