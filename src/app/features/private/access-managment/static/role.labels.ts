import { RoleCode } from "../typings/role-code.type";

export const ROLE_LABELS: Record<RoleCode, string> = {
    owner: 'Owner',
    admin: 'Admin',
    operator: 'Operator',
    viewer: 'Viewer',
    technician: 'Technician',
    security_monitor: 'Security Monitor',
    system_admin: 'System Admin',
};