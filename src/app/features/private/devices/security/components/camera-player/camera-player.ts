import {
    Component,
    DestroyRef,
    ElementRef,
    computed,
    effect,
    inject,
    input,
    OnInit,
    signal,
    viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { CameraStreamService } from '@core/services/camera-stream.service';
import { StreamState, WhepPlayerService } from '@core/services/whep-player.service';

@Component({
    selector: 'hta-camera-player',
    standalone: true,
    imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
    providers: [WhepPlayerService], // Provided at component level so each camera player instance has its own WebRTC session
    templateUrl: './camera-player.html',
    styleUrl: './camera-player.css',
})
export class CameraPlayer implements OnInit {
    readonly deviceId = input.required<string>();
    readonly cameraName = input<string>('Cámara');
    readonly autoPlay = input<boolean>(false);

    readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('video');

    readonly #streamService = inject(CameraStreamService);
    readonly #whepService = inject(WhepPlayerService);
    readonly #destroyRef = inject(DestroyRef);

    readonly #localLoading = signal<boolean>(false);
    readonly #localError = signal<string | null>(null);

    readonly isMuted = signal<boolean>(true);

    readonly state = computed<StreamState>(() => {
        if (this.#localLoading()) {
            return 'loading';
        }
        if (this.#localError()) {
            return 'error';
        }
        return this.#whepService.state();
    });

    readonly errorMessage = computed<string | null>(() => {
        return this.#localError() || this.#whepService.errorMessage();
    });

    constructor() {
        // Watch for mediaStream changes from WhepPlayerService and bind to the video element
        effect(() => {
            const stream = this.#whepService.mediaStream();
            const videoEl = this.videoElement()?.nativeElement;

            if (videoEl && stream) {
                if (videoEl.srcObject !== stream) {
                    videoEl.srcObject = stream;
                    videoEl.play().catch((err) => {
                        // Handle browser autoplay policy restrictions gracefully
                        console.warn('Autoplay prevented by browser policy; user interaction may be required.', err);
                    });
                }
            } else if (videoEl && !stream) {
                videoEl.srcObject = null;
            }
        });

        // Ensure complete cleanup on component destruction
        this.#destroyRef.onDestroy(() => {
            this.#whepService.disconnect();
        });
    }

    ngOnInit(): void {
        if (this.autoPlay()) {
            this.startStream();
        }
    }

    /**
     * Initiates the full streaming resolution flow:
     * 1. Requests fresh Stream Token from hestia-web-api
     * 2. Resolves media path and baseUrl from hestia-iot-app Gateway
     * 3. Connects via WHEP to MediaMTX
     */
    async startStream(): Promise<void> {
        this.#localLoading.set(true);
        this.#localError.set(null);

        const currentDeviceId = this.deviceId();

        this.#streamService.resolveCameraStream(currentDeviceId).subscribe({
            next: async (resolved) => {
                this.#localLoading.set(false);
                try {
                    await this.#whepService.connect(resolved.whepUrl);
                } catch (error: any) {
                    // Check if cancelled/aborted by user or component destruction
                    if (this.#whepService.state() === 'disconnected' || (error?.name === 'AbortError' && !error?.message?.includes('tiempo de espera'))) {
                        return;
                    }

                    const msg = error?.message || '';
                    if (msg.includes('tiempo de espera')) {
                        this.#localError.set('Se agotó el tiempo de espera para conectar con la cámara.');
                    } else if (msg.includes('permisos')) {
                        this.#localError.set('No tenés permisos para visualizar esta cámara.');
                    } else if (msg.includes('disponible')) {
                        this.#localError.set('Cámara no disponible.');
                    } else if (msg.includes('Gateway') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                        this.#localError.set('No se pudo contactar al Gateway.');
                    } else if (msg.includes('conexión')) {
                        this.#localError.set('Se perdió la conexión con la cámara.');
                    } else {
                        this.#localError.set('No se pudo iniciar la transmisión.');
                    }
                }
            },
            error: (err) => {
                this.#localLoading.set(false);
                const status = err?.status;
                if (status === 401 || status === 403) {
                    this.#localError.set('No tenés permisos para visualizar esta cámara.');
                } else if (status === 404) {
                    this.#localError.set('Cámara no disponible.');
                } else if (status === 0 || err?.name === 'TimeoutError' || err?.message?.toLowerCase().includes('gateway')) {
                    this.#localError.set('No se pudo contactar al Gateway.');
                } else {
                    this.#localError.set('No se pudo iniciar la transmisión.');
                }
            },
        });
    }

    /**
     * Explicit reconnection handler: always requests a fresh Stream Token.
     */
    reconnect(): void {
        this.#whepService.disconnect();
        this.startStream();
    }

    /**
     * Stops the active video stream.
     */
    stopStream(): void {
        this.#whepService.disconnect();
    }

    /**
     * Toggles audio mute state. Starts muted to comply with browser autoplay policies.
     */
    toggleAudio(): void {
        const newMuted = !this.isMuted();
        this.isMuted.set(newMuted);
        const videoEl = this.videoElement()?.nativeElement;
        if (videoEl) {
            videoEl.muted = newMuted;
        }
    }
}
