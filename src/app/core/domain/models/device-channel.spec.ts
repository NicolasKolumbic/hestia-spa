import { DeviceChannel } from './device-channel';

describe('DeviceChannel Model', () => {
  const createChannelDto = (overrides: Partial<any> = {}) => ({
    channelId: 'ch-test-1',
    deviceId: 'dev-1',
    channelIndex: 0,
    name: 'Luz Pasillo',
    type: 'SWITCH',
    isPrimary: true,
    isOn: false,
    payload: {},
    ...overrides,
  });

  it('should initialize properties correctly from DTO', () => {
    const channel = new DeviceChannel(
      createChannelDto({
        isOn: true,
        payload: {
          brightness: 80,
          color: '#ffaa00',
        },
      }),
    );

    expect(channel.channelId).toBe('ch-test-1');
    expect(channel.deviceId).toBe('dev-1');
    expect(channel.channelIndex).toBe(0);
    expect(channel.name).toBe('Luz Pasillo');
    expect(channel.type).toBe('SWITCH');
    expect(channel.isOn).toBeTrue();
    expect(channel.brightness).toBe(80);
    expect(channel.color).toBe('#ffaa00');
  });

  describe('isPending & pendingState accessors', () => {
    it('should report isPending=true and pending values when status is IN_FLIGHT', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            pendingState: {
              commandId: 'cmd-pending-1',
              requestedState: { isOn: true },
              status: 'IN_FLIGHT',
              requestedAt: '2026-11-14T10:00:00.000Z',
            },
          },
        }),
      );

      expect(channel.isPending).toBeTrue();
      expect(channel.pendingIsOn).toBeTrue();
      expect(channel.pendingCommandId).toBe('cmd-pending-1');
    });

    it('should report isPending=false when pendingState is missing or not IN_FLIGHT', () => {
      const channel = new DeviceChannel(createChannelDto());
      expect(channel.isPending).toBeFalse();
      expect(channel.pendingIsOn).toBeUndefined();
      expect(channel.pendingCommandId).toBeUndefined();
    });
  });

  describe('historicalError & lastError', () => {
    it('should return undefined when no lastFailedCommand exists', () => {
      const channel = new DeviceChannel(createChannelDto({ payload: {} }));
      expect(channel.historicalError).toBeUndefined();
      expect(channel.lastError).toBeUndefined();
    });

    it('should return error message when lastFailedCommand exists and no confirmedAt exists', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            lastFailedCommand: {
              commandId: 'cmd-fail',
              failedAt: '2026-11-14T10:00:00.000Z',
              error: { code: 'DEVICE_TIMEOUT', message: 'Actuator timeout' },
            },
          },
        }),
      );

      expect(channel.historicalError).toBe('Actuator timeout');
      expect(channel.lastError).toBe('Actuator timeout');
    });

    it('should return undefined when lastConfirmedAt is newer than failedAt (superseded)', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            lastFailedCommand: {
              commandId: 'cmd-fail-old',
              failedAt: '2026-11-14T10:00:00.000Z',
              error: { code: 'FAIL', message: 'Error antiguo' },
            },
            lastConfirmedAt: '2026-11-14T10:05:00.000Z',
          },
        }),
      );

      expect(channel.historicalError).toBeUndefined();
      expect(channel.lastError).toBeUndefined();
    });

    it('should return error message when failedAt is newer than lastConfirmedAt', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            lastConfirmedAt: '2026-11-14T09:00:00.000Z',
            lastFailedCommand: {
              commandId: 'cmd-fail-recent',
              failedAt: '2026-11-14T10:00:00.000Z',
              error: { code: 'FAIL', message: 'Error reciente' },
            },
          },
        }),
      );

      expect(channel.historicalError).toBe('Error reciente');
      expect(channel.lastError).toBe('Error reciente');
    });

    it('should safely handle invalid date strings without throwing', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            lastConfirmedAt: 'invalid-date',
            lastFailedCommand: {
              commandId: 'cmd-fail',
              failedAt: 'not-a-date',
              error: { code: 'ERR', message: 'Safe fallback error' },
            },
          },
        }),
      );

      expect(channel.historicalError).toBe('Safe fallback error');
      expect(channel.lastError).toBe('Safe fallback error');
    });
  });

  describe('isUncertain & uncertainReason', () => {
    it('should return isUncertain=false and uncertainReason=undefined when no lastUncertainCommand exists', () => {
      const channel = new DeviceChannel(createChannelDto({ payload: {} }));
      expect(channel.isUncertain).toBeFalse();
      expect(channel.uncertainReason).toBeUndefined();
    });

    it('should return isUncertain=true and reason when lastUncertainCommand exists with no confirmedAt', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          payload: {
            lastUncertainCommand: {
              commandId: 'cmd-timeout-1',
              status: 'TIMED_OUT',
              reason: 'Timeout awaiting physical confirmation',
              reconciledAt: '2026-11-14T22:00:00.000Z',
              requestedState: { isOn: true },
            },
          },
        }),
      );

      expect(channel.isUncertain).toBeTrue();
      expect(channel.uncertainReason).toBe('Timeout awaiting physical confirmation');
      expect(channel.lastUncertainCommand?.commandId).toBe('cmd-timeout-1');
    });

    it('should return isUncertain=false when lastConfirmedAt is newer than reconciledAt (superseded)', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          isOn: true,
          payload: {
            lastUncertainCommand: {
              commandId: 'cmd-timeout-1',
              status: 'TIMED_OUT',
              reason: 'Timeout awaiting physical confirmation',
              reconciledAt: '2026-11-14T22:00:00.000Z',
              requestedState: { isOn: true },
            },
            lastProcessedCommandId: 'cmd-success-2',
            lastConfirmedAt: '2026-11-14T22:05:00.000Z',
          },
        }),
      );

      expect(channel.isUncertain).toBeFalse();
      expect(channel.uncertainReason).toBeUndefined();
      // Historical diagnostic data remains preserved in payload
      expect(channel.lastUncertainCommand?.commandId).toBe('cmd-timeout-1');
    });

    it('should return isUncertain=true when reconciledAt is newer than lastConfirmedAt', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          isOn: false,
          payload: {
            lastConfirmedAt: '2026-11-14T21:00:00.000Z',
            lastUncertainCommand: {
              commandId: 'cmd-timeout-recent',
              status: 'TIMED_OUT',
              reason: 'Timeout reciente',
              reconciledAt: '2026-11-14T22:00:00.000Z',
              requestedState: { isOn: true },
            },
          },
        }),
      );

      expect(channel.isUncertain).toBeTrue();
      expect(channel.uncertainReason).toBe('Timeout reciente');
    });

    it('should return isUncertain=false when a newer command has been confirmed even without exact timestamps', () => {
      const channel = new DeviceChannel(
        createChannelDto({
          isOn: true,
          payload: {
            lastUncertainCommand: {
              commandId: 'cmd-timeout-1',
              status: 'TIMED_OUT',
              reason: 'Timeout',
              requestedState: { isOn: true },
            },
            lastProcessedCommandId: 'cmd-success-newer',
            lastConfirmedAt: '2026-11-14T22:10:00.000Z',
          },
        }),
      );

      expect(channel.isUncertain).toBeFalse();
      expect(channel.uncertainReason).toBeUndefined();
      expect(channel.lastUncertainCommand?.commandId).toBe('cmd-timeout-1');
    });
  });
});
