import { UserStatus } from "../typings/user-status.type";
import { Membership } from "./membership.interface";

export interface AccessUser {
    id: string;
    fullName: string;
    email: string;
    initials: string;
    status: UserStatus;
    lastLoginAt: string | null;
    memberships: Membership[];
}