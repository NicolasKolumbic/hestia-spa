import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Environment } from './environment';
import { StreamTokenResponseDto } from '@core/domain/dtos/stream-token-response.dto';

export interface ResolvedCameraStream {
    whepUrl: string;
    tokenResponse: StreamTokenResponseDto;
}

@Injectable({
    providedIn: 'root',
})
export class CameraStreamService {
    readonly #http = inject(HttpClient);
    readonly #environment = inject(Environment);

    /**
     * Requests an ephemeral RS256 Stream Token and resolved WHEP URL from the Cloud API
     * for the specified camera device.
     */
    getStreamToken(deviceId: string): Observable<StreamTokenResponseDto> {
        const url = `${this.#environment.apiUrl}/devices/${deviceId}/stream-token`;
        return this.#http.post<StreamTokenResponseDto>(url, {});
    }

    /**
     * Resolves the camera streaming endpoint and ephemeral token directly from Hestia Cloud.
     * The Cloud API acts as the single authority on whepUrl and token generation.
     * The WHEP endpoint URL is returned clean without tokens in query parameters.
     */
    resolveCameraStream(deviceId: string): Observable<ResolvedCameraStream> {
        return this.getStreamToken(deviceId).pipe(
            map((tokenResponse) => ({
                whepUrl: tokenResponse.stream.whepUrl,
                tokenResponse,
            }))
        );
    }
}
