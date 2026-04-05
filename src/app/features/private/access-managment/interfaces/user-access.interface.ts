export type UserStatus = 'active' | 'inactive' | 'blocked';
export type MembershipStatus = 'active' | 'pending' | 'revoked';
export type ScopeType = 'CLIENT' | 'SITE' | 'ZONE' | 'DEVICE';

export interface UserAccess {
    id: string;
    clientId: string;
    fullName: string;
    email: string;
    userStatus: UserStatus;
    membershipStatus: MembershipStatus;
    primaryRoleCode: string;
    primaryRoleName: string;
    primaryScopeType: ScopeType;
    primaryScopeLabel: string;
    lastLoginAt: string | null;
    assignmentsCount: number;
}
