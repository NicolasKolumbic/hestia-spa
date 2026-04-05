import { UserStatus } from "../typings/user-status.type";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
    active: 'Activo',
    pending: 'Pendiente',
    inactive: 'Inactivo',
    revoked: 'Revocado',
};