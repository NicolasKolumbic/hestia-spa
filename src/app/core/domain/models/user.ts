import { Client } from "../dtos/client.dto";
import { LoggedResponseDto } from "../dtos/logged-user-response.dto";

export class User {
    userId!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    picture?: string;
    clients: Client[];

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    constructor({ firstName, lastName, id, clients, email, picture }: LoggedResponseDto) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.picture = picture;
        this.clients = clients;
        this.userId = id;
    }
}