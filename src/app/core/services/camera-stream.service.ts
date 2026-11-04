import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Environment } from './environment';
import { StreamTokenResponseDto } from '@core/domain/dtos/stream-token-response.dto';

export interface ResolvedCameraStream {
    whepUrl: string;
    tokenResponse: StreamTokenResponseDto;
}

/**
 * Safely appends the explicit streamSessionId as the 'jti' query parameter to a WHEP URL.
 * Preserves existing query parameters and guarantees no duplicates can be introduced.
 */
export function buildWhepUrlWithSession(rawUrl: string, sessionId?: string): string {
    try {
        const parsed = new URL(rawUrl);
        parsed.searchParams.delete('token');
        if (sessionId && sessionId.trim()) {
            parsed.searchParams.set('jti', sessionId.trim());
        }
        return parsed.toString();
    } catch {
        const [base, query] = rawUrl.split('?');
        const params = new URLSearchParams(query || '');
        params.delete('token');
        if (sessionId && sessionId.trim()) {
            params.set('jti', sessionId.trim());
        }
        const queryString = params.toString();
        return queryString ? `${base}?${queryString}` : base;
    }
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
     * Incorporates the streamSessionId into the WHEP URL as 'jti' for MediaMTX session correlation
     * without requiring Angular to decode or parse the signed JWT.
     */
    resolveCameraStream(deviceId: string): Observable<ResolvedCameraStream> {
        return this.getStreamToken(deviceId).pipe(
            map((tokenResponse) => ({
                whepUrl: buildWhepUrlWithSession(tokenResponse.stream.whepUrl, tokenResponse.streamSessionId),
                tokenResponse,
            }))
        );
    }
}
