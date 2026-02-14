import { Component, computed, inject, input } from '@angular/core';
import { HostControl } from '@shared/directives/host-control';
import { ButtonModule } from 'primeng/button';
import { Icon } from '@shared/abstractions/icon-selector/icon';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'hta-icon-selector',
  imports: [ButtonModule, MatIconModule, NgClass],
  templateUrl: './icon-selector.html',
  styleUrl: './icon-selector.css',
  hostDirectives: [
    HostControl
  ]
})
export class IconSelector {
  icons = input.required<Icon[]>();
  label = input.required();
  control = inject(HostControl);

  selected = computed<string>(() => this.control.value());

  hasError = computed(() => {
    return this.control.control().invalid && this.control.control().touched;
  });

  selectHandler(icon: Icon) {
    this.control.setValue(icon.name);
    this.control.control().markAsDirty();
    this.control.control().markAsTouched();
  }
}
