import { Component, ElementRef, input, OnInit, viewChild } from '@angular/core';

@Component({
  selector: 'hta-camera-player',
  imports: [],
  templateUrl: './camera-player.html',
  styleUrl: './camera-player.css',
})
export class CameraPlayer implements OnInit {
  deviceId = input.required<string>();
  videoElement = viewChild<ElementRef<HTMLVideoElement>>('video');
  // MediaMTX WHEP URL
  private readonly mediaServerUrl = 'http://localhost:8889';

  async ngOnInit() {
    // 1. Get Auth Token from your AuthService
    const token = localStorage.getItem('access_token');
    // 2. Negotiate WebRTC Connection via WHEP
    // We pass the token as a query param so MediaMTX sends it to NestJS webhook
    const streamUrl = `${this.mediaServerUrl}/${this.deviceId}/whep?token=${token}`;
    this.startStream(streamUrl);
  }
  async startStream(url: string) {
    const peerConnection = new RTCPeerConnection();

    // Add Transceivers (Audio/Video)
    peerConnection.addTransceiver('video', { direction: 'recvonly' });
    peerConnection.addTransceiver('audio', { direction: 'recvonly' });
    // Handle Incoming Tracks
    peerConnection.ontrack = (event) => {
      if (this.videoElement() && this.videoElement()?.nativeElement.srcObject !== event.streams[0]) {
        this.videoElement()!.nativeElement.srcObject = event.streams[0];
      }
    };
    // WHEP Negotiation (Offer/Answer)
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const response = await fetch(url, {
      method: 'POST',
      body: offer.sdp,
      headers: { 'Content-Type': 'application/sdp' } // Standard SDP
    });
    if (response.ok) {
      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } else {
      console.error('Failed to start stream', response.statusText);
    }
  }
}
