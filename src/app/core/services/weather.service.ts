import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { WeatherTimeStampDto } from '@core/domain/dtos/weather/weather-timestamp.dto';
import { WeatherTimeStamp } from '@core/domain/models/weather-timestamp';

@Injectable({
    providedIn: 'root'
})
export class WeatherService {
    #ws = inject(WebSocketService);

    /**
     * Observa el clima en tiempo real para unas coordenadas dadas.
     * Se suscribe al canal Socket.IO al iniciar y envía 'unsubscribe_weather' automáticamente al destruirse la suscripción.
     */
    watchWeather(lat: number, lon: number): Observable<WeatherTimeStamp> {
        return new Observable<WeatherTimeStampDto>(subscriber => {
            this.#ws.connect();
            this.#ws.emit('subscribe_weather', { lat, lon });

            const socketSub = this.#ws.listen<WeatherTimeStampDto>('weather_update').subscribe({
                next: (data) => subscriber.next(data),
                error: (err) => subscriber.error(err),
                complete: () => subscriber.complete(),
            });

            return () => {
                socketSub.unsubscribe();
                this.#ws.emit('unsubscribe_weather', { lat, lon });
            };
        }).pipe(map((data) => new WeatherTimeStamp(data)));
    }
}

