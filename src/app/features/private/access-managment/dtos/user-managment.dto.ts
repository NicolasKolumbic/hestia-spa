export interface UserManagmentDto {
    userId: GUID;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    lastLoginAt: string | null;
    assignmentsCount: number;
    sitiesCounter: number;
    zonesCounter: number;
    devicesCounter: number;
}