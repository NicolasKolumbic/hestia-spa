import { applyMonotonicUpdate } from './device-channel-updater';
import { DeviceChannel } from './device-channel';
import { DeviceChannelDto } from '../dtos/device-channel.dto';

describe('applyMonotonicUpdate', () => {
    const baseChannelDto: DeviceChannelDto = {
        channelId: 'ch-switch-1',
        deviceId: 'dev-1',
        channelIndex: 0,
        name: 'Luz Living',
        type: 'SWITCH',
        isPrimary: true,
        isOn: false,
        payload: {},
    };

    it('1. WebSocket SUCCEEDED before HTTP IN_FLIGHT (neutralize race condition)', () => {
        // Step 1: WebSocket arrived first, confirming physical execution of cmd-101
        const confirmedChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: true,
            payload: {
                lastProcessedCommandId: 'cmd-101',
                lastConfirmedAt: '2026-11-14T18:07:29.005Z',
            },
        });

        // Step 2: Delayed HTTP PUT response arrives with stale snapshot
        const delayedHttpResponse: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-101',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:07:28.800Z',
                    status: 'IN_FLIGHT',
                },
            },
        };

        const result = applyMonotonicUpdate(confirmedChannel, delayedHttpResponse);

        expect(result.applied).toBeFalse();
        expect(result.reason).toBe('STALE_IN_FLIGHT_AFTER_SUCCESS');
        expect(result.channel.isOn).toBeTrue();
        expect(result.channel.isPending).toBeFalse();
    });

    it('2. HTTP IN_FLIGHT before WebSocket SUCCEEDED (normal sequential flow)', () => {
        const initialChannel = new DeviceChannel(baseChannelDto);

        // Step 1: HTTP PUT sets pendingState
        const inFlightHttpDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-102',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:10:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        };

        const step1 = applyMonotonicUpdate(initialChannel, inFlightHttpDto);
        expect(step1.applied).toBeTrue();
        expect(step1.channel.isPending).toBeTrue();
        expect(step1.channel.isOn).toBeFalse(); // Physical state preserved until confirmed

        // Step 2: WebSocket arrives confirming cmd-102
        const wsConfirmedDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: true,
            payload: {
                lastProcessedCommandId: 'cmd-102',
                lastConfirmedAt: '2026-11-14T18:10:00.250Z',
            },
        };

        const step2 = applyMonotonicUpdate(step1.channel, wsConfirmedDto);
        expect(step2.applied).toBeTrue();
        expect(step2.channel.isPending).toBeFalse();
        expect(step2.channel.isOn).toBeTrue();
        expect(step2.channel.payload.lastProcessedCommandId).toBe('cmd-102');
    });

    it('3. WebSocket FAILED before HTTP IN_FLIGHT', () => {
        // Step 1: WebSocket reported failure first
        const failedChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false,
            payload: {
                lastFailedCommand: {
                    commandId: 'cmd-103',
                    failedAt: '2026-11-14T18:12:05.000Z',
                    error: { code: 'DEVICE_TIMEOUT', message: 'Tiempo de espera agotado' },
                },
            },
        });

        // Step 2: Delayed HTTP PUT snapshot arrives with pendingState
        const delayedHttpDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-103',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:12:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        };

        const result = applyMonotonicUpdate(failedChannel, delayedHttpDto);

        expect(result.applied).toBeFalse();
        expect(result.reason).toBe('STALE_IN_FLIGHT_AFTER_FAILURE');
        expect(result.channel.isPending).toBeFalse();
        expect(result.channel.payload.lastFailedCommand?.commandId).toBe('cmd-103');
    });

    it('4. Command already marked UNCERTAIN before delayed HTTP IN_FLIGHT', () => {
        const uncertainChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false,
            payload: {
                lastUncertainCommand: {
                    commandId: 'cmd-104',
                    status: 'TIMED_OUT',
                    reason: 'Watchdog timeout',
                    reconciledAt: '2026-11-14T18:15:08.500Z',
                },
            },
        });

        const delayedHttpDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-104',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:15:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        };

        const result = applyMonotonicUpdate(uncertainChannel, delayedHttpDto);

        expect(result.applied).toBeFalse();
        expect(result.reason).toBe('STALE_IN_FLIGHT_AFTER_UNCERTAIN');
        expect(result.channel.isPending).toBeFalse();
        expect(result.channel.isUncertain).toBeTrue();
    });

    it('5. Duplicate events do not cause unnecessary updates', () => {
        // Case 5.1: Duplicate confirmed event
        const confirmedChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: true,
            payload: {
                lastProcessedCommandId: 'cmd-105',
                lastConfirmedAt: '2026-11-14T18:20:00.000Z',
            },
        });

        const dupConfirmedDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: true,
            payload: {
                lastProcessedCommandId: 'cmd-105',
                lastConfirmedAt: '2026-11-14T18:20:00.000Z',
            },
        };

        const resultConf = applyMonotonicUpdate(confirmedChannel, dupConfirmedDto);
        expect(resultConf.applied).toBeFalse();
        expect(resultConf.reason).toBe('DUPLICATE_CONFIRMED');

        // Case 5.2: Duplicate IN_FLIGHT event
        const pendingChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-106',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:21:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        });

        const dupPendingDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-106',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:21:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        };

        const resultPend = applyMonotonicUpdate(pendingChannel, dupPendingDto);
        expect(resultPend.applied).toBeFalse();
        expect(resultPend.reason).toBe('DUPLICATE_IN_FLIGHT');
    });

    it('6. Confirmations of different commands arriving out of order are rejected', () => {
        // Case 6.1: An older confirmed timestamp cannot overwrite a newer confirmed timestamp
        const modernConfirmedChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false,
            payload: {
                lastProcessedCommandId: 'cmd-new',
                lastConfirmedAt: '2026-11-14T18:30:10.000Z',
            },
        });

        const ancientConfirmedDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: true,
            payload: {
                lastProcessedCommandId: 'cmd-old',
                lastConfirmedAt: '2026-11-14T18:30:00.000Z', // 10 seconds older
            },
        };

        const result = applyMonotonicUpdate(modernConfirmedChannel, ancientConfirmedDto);
        expect(result.applied).toBeFalse();
        expect(result.reason).toBe('OLDER_CONFIRMED_TIMESTAMP');
        expect(result.channel.isOn).toBeFalse(); // Preserves newer confirmed state

        // Case 6.2: An ancient pending request cannot overwrite a newer confirmed state
        const ancientPendingDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: true,
            payload: {
                pendingState: {
                    commandId: 'cmd-ancient',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:29:50.000Z', // requested before lastConfirmedAt
                    status: 'IN_FLIGHT',
                },
            },
        };

        const resultAncient = applyMonotonicUpdate(modernConfirmedChannel, ancientPendingDto);
        expect(resultAncient.applied).toBeFalse();
        expect(resultAncient.reason).toBe('OLDER_REQUESTED_TIMESTAMP');
    });

    it('7. An older confirmation arriving late does not wipe out a newly in-flight command', () => {
        // Current channel is executing a brand-new command requested at 18:40:05
        const activePendingChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false,
            payload: {
                pendingState: {
                    commandId: 'cmd-newer-in-flight',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:40:05.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        });

        // A late confirmation from a previous command (confirmed at 18:40:01) arrives
        const lateOldConfirmationDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                lastProcessedCommandId: 'cmd-older-finished-late',
                lastConfirmedAt: '2026-11-14T18:40:01.000Z',
            },
        };

        const result = applyMonotonicUpdate(activePendingChannel, lateOldConfirmationDto);
        expect(result.applied).toBeFalse();
        expect(result.reason).toBe('OUT_OF_ORDER_STALE_CONFIRMATION');
        expect(result.channel.isPending).toBeTrue();
        expect(result.channel.pendingCommandId).toBe('cmd-newer-in-flight');
    });

    it('8. A FAILED confirmation resolves pendingState while preserving confirmed physical isOn', () => {
        const pendingChannel = new DeviceChannel({
            ...baseChannelDto,
            isOn: false, // current confirmed state is OFF
            payload: {
                pendingState: {
                    commandId: 'cmd-failing',
                    requestedState: { isOn: true },
                    requestedAt: '2026-11-14T18:50:00.000Z',
                    status: 'IN_FLIGHT',
                },
            },
        });

        const failureDto: DeviceChannelDto = {
            ...baseChannelDto,
            isOn: false,
            payload: {
                lastFailedCommand: {
                    commandId: 'cmd-failing',
                    failedAt: '2026-11-14T18:50:05.000Z',
                    error: { code: 'DEVICE_TIMEOUT', message: 'ESP32 no respondió' },
                },
            },
        };

        const result = applyMonotonicUpdate(pendingChannel, failureDto);
        expect(result.applied).toBeTrue();
        expect(result.channel.isPending).toBeFalse();
        expect(result.channel.isOn).toBeFalse();
        expect(result.channel.payload.lastFailedCommand?.commandId).toBe('cmd-failing');
    });
});
