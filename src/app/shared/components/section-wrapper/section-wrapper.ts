import { Component, input } from '@angular/core';

@Component({
  selector: 'hta-section-wrapper',
  imports: [],
  templateUrl: './section-wrapper.html',
  styleUrl: './section-wrapper.css',
})
export class SectionWrapper {
  title = input.required<string>()
  description = input.required<string>()
}
