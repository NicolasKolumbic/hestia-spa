export interface CurrentWeatherDto {
    apparent_temperature: number;
    interval: number;
    precipitation: number;
    relative_humidity_2m: number;
    temperature_2m: number;
    time: string;
    weather_code: number;
    wind_speed_10m: number;
}