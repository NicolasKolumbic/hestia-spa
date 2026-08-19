export interface UserPermissionRequestDto {
    type: 'SITE' | 'ZONE' | 'DEVICE' | 'CLIENT';
    resourceId: string;
    roleId: string;
}