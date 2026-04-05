import { MembershipStatus, ScopeType } from './user-access.interface';

export interface AccessMembershipView {
    id: string;
    clientId: string;
    clientName: string;
    status: MembershipStatus;
    joinedAt: string | null;
    invitedBy: string | null;
}

export interface Role {
    id: string;
    name: string;
    code: string;
}

export interface MembershipRoleAssignment {
    id: string;
    membershipId: string;
    roleId: string;
    scopeType: ScopeType;
    scopeId: string;
    role: Role;
}

export interface AccessUserDetail {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    membership: AccessMembershipView;
    rolesAssigments: MembershipRoleAssignment[];
}
