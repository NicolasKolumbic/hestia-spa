import { UserPermissionRequestDto } from "@core/domain/dtos/permission-request.dto";

export interface UserAccessRequestDto {
    firstName: string;
    lastName: string;
    email: string;
    permissions: UserPermissionRequestDto[];
}

