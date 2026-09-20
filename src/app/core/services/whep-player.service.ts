import { Injectable, signal } from '@angular/core';

export type StreamState = 'idle' | 'loading' | 'connecting' | 'playing' | 'disconnected' | 'error';

@Injectable({
    providedIn: 'root',
})
export class WhepPlayerService {
    #peerConnection: RTCPeerConnection | null = null;
    #resourceLocation: string | null = null;
    #activeWhepUrl: string | null = null;
    #connectAbortController: AbortController | null = null;

    readonly state = signal<StreamState>('idle');
    readonly errorMessage = signal<string | null>(null);
    readonly mediaStream = signal<MediaStream | null>(null);

    /**
     * Connects to MediaMTX using the WHEP standard protocol.
     * Starts by establishing a local RTCPeerConnection with recvonly transceivers,
     * gathers candidates, sends the SDP offer with Authorization Bearer header, and sets the remote SDP answer.
     * Supports cancellation and explicit timeout (10s).
     */
    async connect(whepUrl: string, streamToken: string): Promise<MediaStream> {
        // Disconnect previous session if any exists
        await this.disconnect();

        this.#activeWhepUrl = whepUrl;
        this.state.set('connecting');
        this.errorMessage.set(null);

        this.#connectAbortController = new AbortController();
        const currentAbortController = this.#connectAbortController;

        let isTimeout = false;
        const timeoutTimer = setTimeout(() => {
            isTimeout = true;
            try {
                currentAbortController.abort(new DOMException('Timeout', 'TimeoutError'));
            } catch {
                currentAbortController.abort();
            }
        }, 10000);

        try {
            // 1. Instantiate RTCPeerConnection without external STUN/TURN for LAN/local testing
            const pc = new RTCPeerConnection();
            this.#peerConnection = pc;

            const incomingStream = new MediaStream();
            this.mediaStream.set(incomingStream);

            // 2. Add recvonly transceivers for video and audio
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });

            // 3. Setup event listeners
            pc.ontrack = (event: RTCTrackEvent) => {
                if (event.streams && event.streams[0]) {
                    this.mediaStream.set(event.streams[0]);
                } else {
                    incomingStream.addTrack(event.track);
                    this.mediaStream.set(incomingStream);
                }
                this.state.set('playing');
            };

            pc.onconnectionstatechange = () => {
                if (!this.#peerConnection) return;
                const cState = pc.connectionState;
                if (cState === 'connected') {
                    this.state.set('playing');
                } else if (cState === 'disconnected') {
                    if (this.state() === 'playing') {
                        this.state.set('disconnected');
                    }
                } else if (cState === 'failed') {
                    this.state.set('error');
                    this.errorMessage.set('Se perdió la conexión con la cámara.');
                }
            };

            pc.oniceconnectionstatechange = () => {
                if (!this.#peerConnection) return;
                const iceState = pc.iceConnectionState;
                if (iceState === 'connected' || iceState === 'completed') {
                    this.state.set('playing');
                } else if (iceState === 'failed') {
                    this.state.set('error');
                    this.errorMessage.set('Se perdió la conexión con la cámara.');
                } else if (iceState === 'disconnected') {
                    if (this.state() === 'playing') {
                        this.state.set('disconnected');
                    }
                }
            };

            // Check if cancelled before proceeding
            if (currentAbortController.signal.aborted) {
                throw new DOMException('Aborted before SDP offer', 'AbortError');
            }

            // 4. Create and set local SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 5. Wait for ICE gathering to complete before sending SDP Offer
            await this.#waitForIceGatheringComplete(pc);

            // Check if cancelled before fetch
            if (currentAbortController.signal.aborted) {
                throw new DOMException('Connection aborted by user', 'AbortError');
            }

            const offerSdp = pc.localDescription?.sdp || offer.sdp;
            if (!offerSdp) {
                throw new Error('No se pudo generar la descripción SDP local.');
            }

            // 6. Post SDP offer to MediaMTX WHEP endpoint with Authorization Bearer header
            let response: Response;
            try {
                response = await fetch(whepUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/sdp',
                        'Authorization': `Bearer ${streamToken}`,
                    },
                    body: offerSdp,
                    signal: currentAbortController.signal,
                });
            } catch (fetchErr: any) {
                clearTimeout(timeoutTimer);
                if (isTimeout || currentAbortController.signal.reason?.name === 'TimeoutError' || fetchErr?.name === 'TimeoutError') {
                    throw new Error('Se agotó el tiempo de espera para conectar con la cámara.');
                }
                if (currentAbortController.signal.aborted || fetchErr?.name === 'AbortError') {
                    throw new DOMException('Connection aborted by user', 'AbortError');
                }
                throw new Error('No se pudo contactar al Gateway.');
            }
            clearTimeout(timeoutTimer);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('No tenés permisos para visualizar esta cámara.');
                } else if (response.status === 404) {
                    throw new Error('Cámara no disponible.');
                } else {
                    throw new Error('No se pudo iniciar la transmisión.');
                }
            }

            // Store resource location if returned by MediaMTX for future WHEP session termination
            const locationHeader = response.headers.get('Location') || response.headers.get('location');
            if (locationHeader) {
                this.#resourceLocation = this.#resolveResourceUrl(whepUrl, locationHeader);
            }

            // 7. Process SDP answer
            const answerSdp = await response.text();
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));

            return this.mediaStream() || incomingStream;
        } catch (error: any) {
            clearTimeout(timeoutTimer);

            const isTimeoutError = isTimeout || error?.name === 'TimeoutError' || error?.message?.includes('tiempo de espera');
            const isUserAbort = (error?.name === 'AbortError' || currentAbortController.signal.aborted) && !isTimeoutError;

            if (isUserAbort) {
                // User disconnected or component destroyed: do not set error state
                this.cleanupLocalResources();
                this.state.set('disconnected');
                throw error;
            }

            this.state.set('error');
            const msg = isTimeoutError
                ? 'Se agotó el tiempo de espera para conectar con la cámara.'
                : (error?.message || 'No se pudo iniciar la transmisión.');
            this.errorMessage.set(msg);
            this.cleanupLocalResources();
            throw error;
        } finally {
            if (this.#connectAbortController === currentAbortController) {
                this.#connectAbortController = null;
            }
        }
    }

    /**
     * Disconnects the active WebRTC stream, terminates the WHEP session if applicable,
     * and releases all track and peer connection resources.
     * Aborts any pending WHEP POST connect operation.
     */
    async disconnect(): Promise<void> {
        // 1. Abort in-flight connect POST if active
        if (this.#connectAbortController) {
            try {
                this.#connectAbortController.abort(new DOMException('User disconnected', 'AbortError'));
            } catch {
                this.#connectAbortController.abort();
            }
            this.#connectAbortController = null;
        }

        // 2. Send WHEP DELETE request if a session location was provided with a 4s timeout
        if (this.#resourceLocation) {
            const deleteUrl = this.#resourceLocation;
            this.#resourceLocation = null;
            try {
                const deleteController = new AbortController();
                const deleteTimer = setTimeout(() => {
                    deleteController.abort();
                }, 4000);

                await fetch(deleteUrl, {
                    method: 'DELETE',
                    signal: deleteController.signal,
                });
                clearTimeout(deleteTimer);
            } catch {
                // Ignore network errors or timeouts during session release
            }
        }

        this.cleanupLocalResources();
        this.state.set('disconnected');
    }

    /**
     * Cleans up local PeerConnection, tracks, and media stream references.
     */
    private cleanupLocalResources(): void {
        const stream = this.mediaStream();
        if (stream) {
            stream.getTracks().forEach((track) => {
                try {
                    track.stop();
                } catch {
                    // Ignore track stopping errors
                }
            });
        }

        if (this.#peerConnection) {
            this.#peerConnection.ontrack = null;
            this.#peerConnection.onconnectionstatechange = null;
            this.#peerConnection.oniceconnectionstatechange = null;
            this.#peerConnection.onicegatheringstatechange = null;
            try {
                this.#peerConnection.close();
            } catch {
                // Ignore closing errors
            }
            this.#peerConnection = null;
        }

        this.mediaStream.set(null);
        this.#activeWhepUrl = null;
    }

    /**
     * Awaits until ICE candidate gathering reaches 'complete' state (or timeout fallback).
     */
    #waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
        if (pc.iceGatheringState === 'complete') {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            let timeoutId: any = null;

            const checkState = () => {
                if (pc.iceGatheringState === 'complete') {
                    pc.removeEventListener('icegatheringstatechange', checkState);
                    if (timeoutId) clearTimeout(timeoutId);
                    resolve();
                }
            };

            pc.addEventListener('icegatheringstatechange', checkState);

            // Timeout safety fallback (1.5s) to avoid blocking indefinitely
            timeoutId = setTimeout(() => {
                pc.removeEventListener('icegatheringstatechange', checkState);
                resolve();
            }, 1500);
        });
    }

    /**
     * Resolves absolute resource URL from WHEP endpoint and Location header.
     */
    #resolveResourceUrl(baseWhepUrl: string, locationHeader: string): string {
        try {
            return new URL(locationHeader, baseWhepUrl).toString();
        } catch {
            return locationHeader;
        }
    }
}
