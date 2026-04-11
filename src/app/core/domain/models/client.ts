import { ClientType } from "../../enums/client-type.enum";
import { Status } from "../../enums/status.enum";
import { ClientDto } from "../dtos/client.dto";

export class Client {
    clientId: string;
    name: string;
    cuit: string;
    type: ClientType;
    status: Status;

    constructor(clientDto: ClientDto) {
        this.clientId = clientDto.clientId;
        this.name = clientDto.name;
        this.cuit = clientDto.cuit;
        this.type = <ClientType>clientDto.type;
        this.status = <Status>clientDto.status;
    }
}