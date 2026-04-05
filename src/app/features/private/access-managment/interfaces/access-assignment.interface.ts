import { RoleCode } from "../typings/role-code.type";
import { ScopeType } from "../typings/scope.type";

export interface AccessAssignment {
    id: string;
    role: RoleCode;
    scopeType: ScopeType;
    scopeId: string;
    scopeLabel: string;
}