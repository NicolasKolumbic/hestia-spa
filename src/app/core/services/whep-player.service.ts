import { Injectable, signal } from '@angular/core';

export type StreamState = 'idle' | 'loading' | 'connecting' | 'playing' | 'disconnected' | 'error';

@Injectable({
    providedIn: 'root',
})
export class WhepPlayerService {
    #peerConnection: RTCPeerConnection | null = null;
    #resourceLocation: string | null = null;
    #activeWhepUrl: string | null = null;

    readonly state = signal<StreamState>('idle');
    readonly errorMessage = signal<string | null>(null);
    readonly mediaStream = signal<MediaStream | null>(null);

    /**
     * Connects to MediaMTX using the WHEP standard protocol.
     * Starts by establishing a local RTCPeerConnection with recvonly transceivers,
     * gathers candidates, sends the SDP offer, and sets the remote SDP answer.
     */
    async connect(whepUrl: string): Promise<MediaStream> {
        // Disconnect previous session if any exists
        await this.disconnect();

        this.#activeWhepUrl = whepUrl;
        this.state.set('connecting');
        this.errorMessage.set(null);

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
                    this.errorMessage.set('La conexión WebRTC ha fallado.');
                }
            };

            pc.oniceconnectionstatechange = () => {
                if (!this.#peerConnection) return;
                const iceState = pc.iceConnectionState;
                if (iceState === 'connected' || iceState === 'completed') {
                    this.state.set('playing');
                } else if (iceState === 'failed') {
                    this.state.set('error');
                    this.errorMessage.set('Error en la negociación ICE.');
                } else if (iceState === 'disconnected') {
                    if (this.state() === 'playing') {
                        this.state.set('disconnected');
                    }
                }
            };

            // 4. Create and set local SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 5. Wait for ICE gathering to complete before sending SDP Offer
            await this.#waitForIceGatheringComplete(pc);

            const offerSdp = pc.localDescription?.sdp || offer.sdp;
            if (!offerSdp) {
                throw new Error('No se pudo generar la descripción SDP local.');
            }

            // 6. Post SDP offer to MediaMTX WHEP endpoint
            const response = await fetch(whepUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                },
                body: offerSdp,
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(
                    `Fallo en la negociación WHEP: ${response.status} ${response.statusText}${errorBody ? ` (${errorBody})` : ''}`
                );
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
            this.state.set('error');
            const msg = error?.message || 'Error desconocido al inicializar el stream WebRTC.';
            this.errorMessage.set(msg);
            this.cleanupLocalResources();
            throw error;
        }
    }

    /**
     * Disconnects the active WebRTC stream, terminates the WHEP session if applicable,
     * and releases all track and peer connection resources.
     */
    async disconnect(): Promise<void> {
        // Send WHEP DELETE request if a session location was provided
        if (this.#resourceLocation) {
            try {
                await fetch(this.#resourceLocation, { method: 'DELETE' });
            } catch {
                // Ignore network errors during session release
            }
            this.#resourceLocation = null;
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
