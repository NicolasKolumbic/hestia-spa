import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ButtonState } from './models/button-state';

type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger';

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
  severity = input<Severity>();
  disabled = input<boolean>(false);
  outlined = input<boolean>(false);
  state = input<ButtonState>();

  isDisabled = computed(() => this.state() && this.state()?.isDisabled || this.disabled())

  click = output<void>();

  onClickHandler(): void {
    this.click.emit();
  }
}
