import { Status } from "@core/enums/status.enum";
import { ScopeType } from "../typings/scope.type";

export interface AccessMembershipView {
    id: string;
    clientId: string;
    clientName: string;
    status: Status;
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
