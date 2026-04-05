import { RoleCode } from "../typings/role-code.type";
import { ScopeType } from "../typings/scope.type";

export interface InviteForm {
    fullName: string;
    email: string;
    role: RoleCode;
    scopeType: ScopeType;
}