import { Component, signal } from '@angular/core';

@Component({
  selector: 'hta-hestia-brand',
  imports: [],
  templateUrl: './hestia-brand.html',
  styleUrl: './hestia-brand.css',
})
export class HestiaBrand {
  primaryColor = signal<string>('#f37321');
  secondaryColor = signal<string>('#36454f');
}
