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
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { CameraStreamService } from '@core/services/camera-stream.service';
import { StreamState, WhepPlayerService } from '@core/services/whep-player.service';

export type PlayerState =
    | 'idle'
    | 'authorizing'
    | 'connecting'
    | 'playing'
    | 'reconnecting'
    | 'stopped'
    | 'disconnected'
    | 'error'
    | 'unavailable';

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

    #currentGeneration = 0;
    #activeSubscription: Subscription | null = null;
    #retryTimer: any = null;
    #retryCount = 0;
    readonly #backoffDelays = [2000, 4000, 8000];

    readonly playerState = signal<PlayerState>('idle');
    readonly playerErrorMessage = signal<string | null>(null);
    readonly retryAttempt = signal<number>(0);
    readonly isMuted = signal<boolean>(true);

    readonly state = computed<PlayerState>(() => {
        const ps = this.playerState();
        if (
            ps === 'authorizing' ||
            ps === 'reconnecting' ||
            ps === 'stopped' ||
            ps === 'unavailable'
        ) {
            return ps;
        }
        if (ps === 'error') {
            return 'error';
        }
        const ws = this.#whepService.state();
        if (ws === 'playing') {
            return 'playing';
        }
        if (ws === 'connecting') {
            return 'connecting';
        }
        if (ws === 'disconnected') {
            return 'disconnected';
        }
        return ps;
    });

    readonly errorMessage = computed<string | null>(() => {
        return this.playerErrorMessage() || this.#whepService.errorMessage();
    });

    constructor() {
        // Interruption callback from WhepPlayerService
        this.#whepService.onStreamInterrupted = () => {
            if (this.state() === 'playing') {
                this.#handleInterruption();
            }
        };

        // Watch for mediaStream changes from WhepPlayerService and bind to the video element
        effect(() => {
            const stream = this.#whepService.mediaStream();
            const videoEl = this.videoElement()?.nativeElement;

            if (videoEl && stream) {
                if (videoEl.srcObject !== stream) {
                    videoEl.srcObject = stream;
                    videoEl.play().catch((err) => {
                        console.warn('Autoplay prevented by browser policy; user interaction may be required.', err);
                    });
                }
            } else if (videoEl && !stream) {
                videoEl.srcObject = null;
            }
        });

        // Ensure complete cleanup on component destruction
        this.#destroyRef.onDestroy(() => {
            this.#cleanup();
        });
    }

    #cleanup(): void {
        this.#currentGeneration++;
        if (this.#retryTimer) {
            clearTimeout(this.#retryTimer);
            this.#retryTimer = null;
        }
        if (this.#activeSubscription) {
            this.#activeSubscription.unsubscribe();
            this.#activeSubscription = null;
        }
        this.#whepService.disconnect();
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
    async startStream(isRetry: boolean = false): Promise<void> {
        if (!isRetry) {
            this.#retryCount = 0;
            this.retryAttempt.set(0);
        }

        if (this.#retryTimer) {
            clearTimeout(this.#retryTimer);
            this.#retryTimer = null;
        }

        if (this.#activeSubscription) {
            this.#activeSubscription.unsubscribe();
            this.#activeSubscription = null;
        }

        const generation = ++this.#currentGeneration;
        const currentDeviceId = this.deviceId();

        if (!isRetry) {
            this.playerState.set('authorizing');
            this.playerErrorMessage.set(null);
        }

        this.#activeSubscription = this.#streamService.resolveCameraStream(currentDeviceId).subscribe({
            next: async (resolved) => {
                if (this.#currentGeneration !== generation) {
                    return;
                }

                this.playerState.set('connecting');

                try {
                    await this.#whepService.connect(resolved.whepUrl, resolved.tokenResponse.token);

                    if (this.#currentGeneration !== generation) {
                        // Superseded while negotiating WHEP: disconnect orphan session
                        await this.#whepService.disconnect();
                        return;
                    }

                    this.#retryCount = 0;
                    this.retryAttempt.set(0);
                    this.playerState.set('playing');
                } catch (error: any) {
                    if (this.#currentGeneration !== generation) {
                        return;
                    }
                    this.#handleStreamError(error, generation);
                }
            },
            error: (err) => {
                if (this.#currentGeneration !== generation) {
                    return;
                }
                this.#handleStreamError(err, generation);
            },
        });
    }

    #handleStreamError(error: any, generation: number): void {
        const isAbort =
            this.#whepService.state() === 'disconnected' ||
            (error?.name === 'AbortError' && !error?.message?.includes('tiempo de espera'));

        if (isAbort) {
            this.playerState.set('disconnected');
            this.playerErrorMessage.set(null);
            return;
        }

        const status = error?.status;
        const msg: string = error?.message || '';

        // Permanent authorization errors: 401, 403, or permissions
        if (
            status === 401 ||
            status === 403 ||
            msg.toLowerCase().includes('permisos') ||
            msg.toLowerCase().includes('autorizado')
        ) {
            this.playerState.set('error');
            this.playerErrorMessage.set('No tenés permisos para visualizar esta cámara.');
            this.#retryCount = 0;
            this.retryAttempt.set(0);
            return;
        }

        // Camera not found / unavailable: 404
        if (
            status === 404 ||
            msg.toLowerCase().includes('disponible') ||
            msg.toLowerCase().includes('not found')
        ) {
            this.playerState.set('error');
            this.playerErrorMessage.set('Cámara no disponible.');
            this.#retryCount = 0;
            this.retryAttempt.set(0);
            return;
        }

        // Determine user-friendly description
        let userMessage = 'No se pudo iniciar la transmisión.';
        if (msg.includes('tiempo de espera') || error?.name === 'TimeoutError') {
            userMessage = 'Se agotó el tiempo de espera para conectar con la cámara.';
        } else if (
            status === 0 ||
            msg.toLowerCase().includes('gateway') ||
            msg.includes('Failed to fetch')
        ) {
            userMessage = 'No se pudo contactar al Gateway.';
        } else if (msg.toLowerCase().includes('conexión')) {
            userMessage = 'Se perdió la conexión con la cámara.';
        }

        // Recoverable error: automatic retries with backoff 2s, 4s, 8s
        if (this.#retryCount < 3) {
            this.#retryCount++;
            this.retryAttempt.set(this.#retryCount);
            this.playerState.set('reconnecting');
            this.playerErrorMessage.set(userMessage);

            const delay = this.#backoffDelays[this.#retryCount - 1] || 8000;
            this.#retryTimer = setTimeout(() => {
                if (this.#currentGeneration === generation) {
                    this.startStream(true);
                }
            }, delay);
        } else {
            this.playerState.set('error');
            this.playerErrorMessage.set(
                'Se agotaron los reintentos de conexión. Verificá la cámara y volvé a intentar.'
            );
        }
    }

    #handleInterruption(): void {
        const generation = ++this.#currentGeneration;

        if (this.#retryCount < 3) {
            this.#retryCount++;
            this.retryAttempt.set(this.#retryCount);
            this.playerState.set('reconnecting');
            this.playerErrorMessage.set('Se interrumpió la señal de video. Reconectando...');

            const delay = this.#backoffDelays[this.#retryCount - 1] || 8000;
            this.#retryTimer = setTimeout(() => {
                if (this.#currentGeneration === generation) {
                    this.startStream(true);
                }
            }, delay);
        } else {
            this.playerState.set('error');
            this.playerErrorMessage.set(
                'Se agotaron los reintentos de conexión. Verificá la cámara y volvé a intentar.'
            );
        }
    }

    /**
     * Explicit reconnection handler: always requests a fresh Stream Token.
     */
    reconnect(): void {
        this.#cleanup();
        this.#retryCount = 0;
        this.retryAttempt.set(0);
        this.startStream(false);
    }

    /**
     * Stops the active video stream.
     */
    stopStream(): void {
        this.#cleanup();
        this.#retryCount = 0;
        this.retryAttempt.set(0);
        this.playerState.set('stopped');
        this.playerErrorMessage.set(null);
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
