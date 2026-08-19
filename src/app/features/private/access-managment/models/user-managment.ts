import { UserAccessStatus } from "@shared/enums/user-access-status.enum";
import { UserManagmentDto } from "../dtos/user-managment.dto";

export class UserManagment {
    userId: GUID;
    email: string;
    firstName: string;
    lastName: string;
    lastLoginAt: string | null;
    status: UserAccessStatus;
    sitiesCounter: number;
    zonesCounter: number;
    devicesCounter: number;
    assignmentsCount: number;
    initials: string;

    constructor({ userId, email, firstName, lastName, lastLoginAt, status, assignmentsCount, sitiesCounter, zonesCounter, devicesCounter }: UserManagmentDto) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.lastLoginAt = lastLoginAt;
        this.status = <UserAccessStatus>status;
        this.sitiesCounter = sitiesCounter;
        this.zonesCounter = zonesCounter;
        this.devicesCounter = devicesCounter;
        this.assignmentsCount = assignmentsCount;
        this.initials = this.#getInitial();
    }

    #getInitial(): string {
        return `${this.firstName.charAt(0).toUpperCase()}${this.lastName.charAt(0).toUpperCase()}`
    }
}