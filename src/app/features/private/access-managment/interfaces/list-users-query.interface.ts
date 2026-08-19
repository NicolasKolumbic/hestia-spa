export interface ListUsersQuery {
  search?: string;
  status?: string;
  roleCode?: string;
  scopeType?: 'CLIENT' | 'SITE' | 'ZONE' | 'DEVICE';
}
