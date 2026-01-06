import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'hta-slider',
  imports: [FormsModule, SliderModule],
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class Slider {
  value: number = 50;
}
