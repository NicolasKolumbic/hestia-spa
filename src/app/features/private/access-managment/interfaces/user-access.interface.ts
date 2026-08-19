import { RoleCode } from "../typings/role-code.type";
import { ScopeType } from "../typings/scope.type";
import { UserStatus } from "../typings/user-status.type";

export interface UserAccess {
    id: GUID;
    clientId: GUID;
    fullName: string;
    email: string;
    userStatus: UserStatus;
    membershipStatus: UserStatus;
    primaryRoleCode: RoleCode;
    primaryRoleName: RoleCode;
    primaryScopeType: ScopeType;
    primaryScopeLabel: ScopeType;
    lastLoginAt: string | null;
    assignmentsCount: number;
}
