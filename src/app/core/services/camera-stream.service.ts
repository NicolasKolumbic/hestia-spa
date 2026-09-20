import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Environment } from './environment';
import { StreamTokenResponseDto } from '@core/domain/dtos/stream-token-response.dto';
import { CameraStreamInfoDto } from '@core/domain/dtos/camera-stream-info.dto';

export interface ResolvedCameraStream {
    whepUrl: string;
    streamInfo: CameraStreamInfoDto;
    tokenResponse: StreamTokenResponseDto;
}

@Injectable({
    providedIn: 'root',
})
export class CameraStreamService {
    readonly #http = inject(HttpClient);
    readonly #environment = inject(Environment);

    /**
     * Requests an ephemeral RS256 Stream Token from the Cloud API for the specified camera device.
     */
    getStreamToken(deviceId: string): Observable<StreamTokenResponseDto> {
        const url = `${this.#environment.apiUrl}/devices/${deviceId}/stream-token`;
        return this.#http.post<StreamTokenResponseDto>(url, {});
    }

    /**
     * Queries the local IoT Gateway to resolve the camera streaming configuration (path, baseUrl, protocol).
     */
    getGatewayStreamInfo(deviceId: string): Observable<CameraStreamInfoDto> {
        const gatewayBase = this.#environment.gatewayUrl.replace(/\/+$/, '');
        const url = `${gatewayBase}/cameras/by-device/${deviceId}/stream`;
        return this.#http.get<CameraStreamInfoDto>(url);
    }

    /**
     * Resolves both the Stream Token and the Gateway stream metadata in parallel
     * and constructs the WHEP endpoint URL ready for WebRTC negotiation.
     * The token is never stored in persistent storage.
     */
    resolveCameraStream(deviceId: string): Observable<ResolvedCameraStream> {
        return forkJoin({
            tokenResponse: this.getStreamToken(deviceId),
            streamInfo: this.getGatewayStreamInfo(deviceId),
        }).pipe(
            map(({ tokenResponse, streamInfo }) => {
                const cleanBase = streamInfo.baseUrl.replace(/\/+$/, '');
                const cleanPath = streamInfo.path.replace(/^\/+/, '');
                const whepUrl = `${cleanBase}/${cleanPath}/whep?token=${encodeURIComponent(tokenResponse.token)}`;

                return {
                    whepUrl,
                    streamInfo,
                    tokenResponse,
                };
            })
        );
    }
}
