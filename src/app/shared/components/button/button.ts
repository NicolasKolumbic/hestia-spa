import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'hta-button',
  imports: [
    ButtonModule,
    CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  label = input.required<string>();
  icon = input.required<string>();

  click = output<void>();

  onClickHandler(): void {
    this.click.emit();
  }
}
