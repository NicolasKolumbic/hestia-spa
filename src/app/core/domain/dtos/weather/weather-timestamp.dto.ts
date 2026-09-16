import { CurrentWeatherDto } from "./current-weather.dto";
import { CurrentWeatherUnitsDto } from "./current-weather-units.dto";

export interface WeatherTimeStampDto {
    current: CurrentWeatherDto;
    current_units: CurrentWeatherUnitsDto;
    elevation: number;
    generationtime_ms: number;
    latitude: number;
    longitude: number;
    timezone: string;
    timezone_abbreviation: string;
    utc_offset_seconds: number;
}