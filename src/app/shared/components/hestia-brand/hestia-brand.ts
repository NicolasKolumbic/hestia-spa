import { Component, HostBinding, input, signal } from '@angular/core';

@Component({
  selector: 'hta-hestia-brand',
  imports: [],
  templateUrl: './hestia-brand.html',
  styleUrl: './hestia-brand.css',
})
export class HestiaBrand {
  width = input<string>('100%');

  @HostBinding('style.width')
  get widthStyle() {
    return this.width();
  }
}
