import { RoleCode, ScopeType, UserStatus } from "../typings";

export interface ListUsersQuery {
  search?: string;
  status?: UserStatus[];
  roleCode?: RoleCode[];
  scopeType?: ScopeType[];
}
