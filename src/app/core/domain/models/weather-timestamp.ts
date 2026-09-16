import { WeatherTimeStampDto } from "../dtos/weather/weather-timestamp.dto";

export class WeatherTimeStamp {
    temperature: number;
    apparent_temperature: number;
    precipitation: number;
    humidity: number;
    weather_code: number;
    wind_speed: number;


    constructor({ current: { apparent_temperature, temperature_2m, relative_humidity_2m, precipitation, weather_code, wind_speed_10m }, current_units }: WeatherTimeStampDto) {
        this.temperature = temperature_2m;
        this.apparent_temperature = apparent_temperature;
        this.precipitation = precipitation;
        this.humidity = relative_humidity_2m;
        this.weather_code = weather_code;
        this.wind_speed = wind_speed_10m;
    }
}