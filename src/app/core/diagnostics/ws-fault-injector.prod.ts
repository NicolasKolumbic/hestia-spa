import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';

/**
 * Production stub for WsFaultInjector.
 * Contains no diagnostic logic, no state, no strings, and no DevTools exposure.
 * Substituted during production build via angular.json fileReplacements.
 */
export class WsFaultInjector {
    arm(): void {}
    disarm(): void {}
    shouldDrop(_channel: DeviceChannelDto): boolean {
        return false;
    }
    isActive(): boolean {
        return false;
    }
}
