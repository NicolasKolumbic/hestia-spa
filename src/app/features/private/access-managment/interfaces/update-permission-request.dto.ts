import { PermissionDto } from "./permission-dto";

export interface UpdatePermissionRequestDto {
    userId?: string;
    firstName?: string;
    lastName?: string;
    toDelete?: string[];
    toUpdate?: Pick<PermissionDto, 'roleId' | 'assignmentId'>[];
    toAdd?: Omit<PermissionDto, 'assignmentId'>[];
}
