import { ScopeType } from "../typings/scope.type";

export interface PermissionDto {
    assignmentId?: string;
    roleId: string;
    scopeId: string;
    scopeType: ScopeType;
}