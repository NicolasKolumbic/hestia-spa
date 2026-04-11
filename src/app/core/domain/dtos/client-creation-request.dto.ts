import { ClientType } from "../../enums/client-type.enum";

export interface ClientCreationRequestDto {
    name: string;
    cuit: string;
    type: ClientType;
}
