export type DeviceChannelType =
    // Iluminación
    | 'SWITCH'
    | 'DIMMER'
    | 'RGB_LIGHT'
    // Clima
    | 'THERMOSTAT'
    // Sensores
    | 'SENSOR_TEMP'
    | 'SENSOR_HUMIDITY'
    | 'SENSOR_MOTION'
    | 'SENSOR_POWER'
    // Seguridad
    | 'CAMERA'
    | 'LOCK'
    // Legado
    | 'SENSOR'; // @deprecated

/** Tipos que corresponden a dispositivos de iluminación */
export const LIGHTING_CHANNEL_TYPES: DeviceChannelType[] = ['SWITCH', 'DIMMER', 'RGB_LIGHT'];

/** Tipos que corresponden a dispositivos de clima */
export const CLIMATE_CHANNEL_TYPES: DeviceChannelType[] = ['THERMOSTAT', 'SENSOR_TEMP', 'SENSOR_HUMIDITY'];

/** Tipos que corresponden a electrónica/consumo */
export const ENERGY_CHANNEL_TYPES: DeviceChannelType[] = ['SENSOR_POWER'];

/** Tipos que corresponden a seguridad */
export const SECURITY_CHANNEL_TYPES: DeviceChannelType[] = ['CAMERA', 'LOCK', 'SENSOR_MOTION'];

/** Tipos que son sensores (solo lectura) */
export const SENSOR_CHANNEL_TYPES: DeviceChannelType[] = ['SENSOR_TEMP', 'SENSOR_HUMIDITY', 'SENSOR_MOTION', 'SENSOR_POWER', 'SENSOR'];
