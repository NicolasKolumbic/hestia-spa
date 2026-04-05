export interface ListUsersQuery {
  clientId: string;
  search?: string;
  status?: string;
  roleCode?: string;
  scopeType?: 'CLIENT' | 'SITE' | 'ZONE' | 'DEVICE';
}
