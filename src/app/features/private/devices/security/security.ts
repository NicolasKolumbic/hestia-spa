import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '@core/services/device.service';
import { CameraPlayer } from './components/camera-player/camera-player';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, CameraPlayer],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security implements OnInit {
  readonly #deviceService = inject(DeviceService);

  readonly cameraDevices = this.#deviceService.cameraDevices;

  readonly totalCameras = computed<number>(() => this.cameraDevices().length);

  readonly onlineCameras = computed<number>(() =>
    this.cameraDevices().filter(c => c.status === 'ONLINE').length
  );

  ngOnInit(): void {
    this.#deviceService.getAllDevices().subscribe(() => {
      console.log(this.cameraDevices());
    });
  }
}
