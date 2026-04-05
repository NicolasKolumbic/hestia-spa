import { MembershipStatus } from "../typings/membership-status.type";
import { AccessAssignment } from "./access-assignment.interface";

export interface Membership {
    id: string;
    clientId: string;
    clientName: string;
    status: MembershipStatus;
    invitedBy: string;
    joinedAt: string;
    assignments: AccessAssignment[];
}