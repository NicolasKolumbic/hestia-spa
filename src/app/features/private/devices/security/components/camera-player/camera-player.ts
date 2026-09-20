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
    readonly autoPlay = input<boolean>(true);

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
                    this.#localError.set(error?.message || 'Error al conectar con el servidor de video.');
                }
            },
            error: (err) => {
                this.#localLoading.set(false);
                const status = err?.status;
                if (status === 404) {
                    this.#localError.set('La cámara no está disponible o está deshabilitada en el Gateway.');
                } else if (status === 403) {
                    this.#localError.set('No tienes permisos suficientes para visualizar esta cámara.');
                } else if (status === 401) {
                    this.#localError.set('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
                } else {
                    this.#localError.set('No se pudo obtener la configuración de streaming de la cámara.');
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
