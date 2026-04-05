export interface UpdateRoleAssignmentPayload {
  clientId: string;
  roleId: string;
  scopeType: 'CLIENT' | 'SITE' | 'ZONE' | 'DEVICE';
  scopeId: string;
}
