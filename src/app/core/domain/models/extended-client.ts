import { ClientType } from "../../enums/client-type.enum";
import { Status } from "../../enums/status.enum";
import { ClientDto } from "../dtos/client.dto";

export class ExtendedClient {
    clientId: GUID;
    name: string;
    cuit: string;
    type: ClientType;
    status: Status;
    devicesCount: number;
    usersCount: number;

    constructor(clientDto: ClientDto, devicesCount: number, usersCount: number) {
        this.clientId = clientDto.clientId;
        this.name = clientDto.name;
        this.cuit = clientDto.cuit;
        this.type = <ClientType>clientDto.type;
        this.status = <Status>clientDto.status;
        this.devicesCount = devicesCount;
        this.usersCount = usersCount;
    }

    get isActive(): boolean {
        return this.status === Status.ACTIVE;
    }
}