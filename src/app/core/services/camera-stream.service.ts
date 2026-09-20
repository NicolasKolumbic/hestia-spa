import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
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
     * Protected endpoint: requires Authorization: Bearer <STREAM_TOKEN>.
     */
    getGatewayStreamInfo(deviceId: string, streamToken: string): Observable<CameraStreamInfoDto> {
        const gatewayBase = this.#environment.gatewayUrl.replace(/\/+$/, '');
        const url = `${gatewayBase}/cameras/by-device/${deviceId}/stream`;
        return this.#http.get<CameraStreamInfoDto>(url, {
            headers: {
                Authorization: `Bearer ${streamToken}`,
            },
        });
    }

    /**
     * Resolves the Stream Token first, then queries the Gateway with Bearer authentication,
     * and constructs the clean WHEP endpoint URL (without tokens in query string).
     * The token is never stored in persistent storage.
     */
    resolveCameraStream(deviceId: string): Observable<ResolvedCameraStream> {
        return this.getStreamToken(deviceId).pipe(
            switchMap((tokenResponse) =>
                this.getGatewayStreamInfo(deviceId, tokenResponse.token).pipe(
                    map((streamInfo) => {
                        const cleanBase = streamInfo.baseUrl.replace(/\/+$/, '');
                        const cleanPath = streamInfo.path.replace(/^\/+/, '');
                        const whepUrl = `${cleanBase}/${cleanPath}/whep`;

                        return {
                            whepUrl,
                            streamInfo,
                            tokenResponse,
                        };
                    })
                )
            )
        );
    }
}
