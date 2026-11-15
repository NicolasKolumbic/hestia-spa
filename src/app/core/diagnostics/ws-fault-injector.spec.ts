import { WsFaultInjector } from './ws-fault-injector';
import { DeviceChannelDto } from '../domain/dtos/device-channel.dto';

describe('WsFaultInjector', () => {
    let injector: WsFaultInjector;

    const baseChannelDto: DeviceChannelDto = {
        channelId: 'ch-light',
        deviceId: 'dev-1',
        channelIndex: 0,
        name: 'Luz Cocina',
        type: 'SWITCH',
        isPrimary: true,
        isOn: true,
        payload: {
            lastProcessedCommandId: 'cmd-100',
            lastConfirmedAt: new Date().toISOString(),
        },
    };

    beforeEach(() => {
        injector = new WsFaultInjector();
    });

    it('1. Selectively drops a terminal channelUpdate when armed', () => {
        injector.arm('ch-light');
        expect(injector.isActive()).toBeTrue();

        const dropped = injector.shouldDrop(baseChannelDto);
        expect(dropped).toBeTrue();
    });

    it('2. Does NOT drop events for other channels', () => {
        injector.arm('ch-light');

        const otherChannelDto: DeviceChannelDto = {
            ...baseChannelDto,
            channelId: 'ch-other',
        };

        const dropped = injector.shouldDrop(otherChannelDto);
        expect(dropped).toBeFalse();
        // Should remain armed for the target channel
        expect(injector.isActive()).toBeTrue();
    });

    it('3. Never drops IN_FLIGHT events', () => {
        injector.arm('ch-light');

        const inFlightDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-100',
                    requestedState: { isOn: true },
                    requestedAt: new Date().toISOString(),
                    status: 'IN_FLIGHT',
                },
            },
        };

        const dropped = injector.shouldDrop(inFlightDto);
        expect(dropped).toBeFalse();
        // Remains armed awaiting the terminal event
        expect(injector.isActive()).toBeTrue();
    });

    it('4. Automatically disarms after dropping exactly one terminal event (one-shot)', () => {
        injector.arm('ch-light');

        // First terminal event: dropped!
        const droppedFirst = injector.shouldDrop(baseChannelDto);
        expect(droppedFirst).toBeTrue();
        expect(injector.isActive()).toBeFalse(); // Auto-disarmed!

        // Second terminal event: allowed through!
        const droppedSecond = injector.shouldDrop(baseChannelDto);
        expect(droppedSecond).toBeFalse();
    });

    it('5. Normal behavior when disabled / disarmed', () => {
        // Not armed
        expect(injector.isActive()).toBeFalse();
        expect(injector.shouldDrop(baseChannelDto)).toBeFalse();

        // Armed and manually disarmed
        injector.arm('ch-light');
        injector.disarm();
        expect(injector.isActive()).toBeFalse();
        expect(injector.shouldDrop(baseChannelDto)).toBeFalse();
    });

    it('6. Matches specific commandId if provided', () => {
        injector.arm('ch-light', 'cmd-targeted');

        // Event for a different commandId -> do NOT drop
        const differentCmdDto: DeviceChannelDto = {
            ...baseChannelDto,
            payload: {
                lastProcessedCommandId: 'cmd-other',
            },
        };
        expect(injector.shouldDrop(differentCmdDto)).toBeFalse();
        expect(injector.isActive()).toBeTrue();

        // Event for targeted commandId -> DROP IT
        const targetCmdDto: DeviceChannelDto = {
            ...baseChannelDto,
            payload: {
                lastProcessedCommandId: 'cmd-targeted',
            },
        };
        expect(injector.shouldDrop(targetCmdDto)).toBeTrue();
        expect(injector.isActive()).toBeFalse();
    });
});
