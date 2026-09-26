import { StreamInfoDto } from './stream-info.dto';

export interface StreamTokenResponseDto {
    token: string;
    expiresIn: number;
    deviceId: string;
    gatewayId: string;
    stream: StreamInfoDto;
}
