export interface InviteUserPayload {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  scopeType: 'CLIENT' | 'SITE' | 'ZONE' | 'DEVICE';
  scopeId: string;
  message?: string;
}
