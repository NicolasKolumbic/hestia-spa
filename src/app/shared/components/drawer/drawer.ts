import { Binding, Component, ComponentRef, DestroyRef, inject, input, inputBinding, model, signal, viewChild } from '@angular/core';
import { ViewContainer } from '@shared/directives/view-container';
import { DrawerModule, Drawer as ngDrawer } from 'primeng/drawer';
import { Button } from '../button/button';
import { DrawerBody } from './interfaces/drawer-body';
import { InternalDrawer } from './interfaces/internal-drawer';
import { DrawerManagerService } from './services/drawer-manager.service';

@Component({
  selector: 'hta-drawer',
  imports: [DrawerModule, ViewContainer, Button],
  templateUrl: './drawer.html',
  styleUrl: './drawer.css',
})
export class Drawer {
  drawer = viewChild.required(ngDrawer);
  container = viewChild.required(ViewContainer);

  drawerRef = signal<InternalDrawer<unknown> | null>(null);
  title = signal<string>('');
  isVisible = model<boolean>(false);

  #destroyRef = inject(DestroyRef);
  #drawerManagerService = inject(DrawerManagerService)
  #component = signal<ComponentRef<DrawerBody> | null>(null);

  constructor() {
    this.#drawerManagerService.onDrawerOpen$.subscribe((drawerRef: InternalDrawer<unknown>) => {
      this.#openDrawer(drawerRef);
    });
  }

  confirmHandler(): void {
    this.drawerRef()?.emit();
    this.#close();
  }

  closeHandler(): void {
    if (this.drawerRef()) {
      if (this.drawerRef()!.beforeClose.hasLink) {
        this.drawerRef()!.beforeClose.result().subscribe((close: boolean | undefined) => {
          if (close) {
            this.#close()
          }
        })
      } else {
        this.#close()
      }
    }
  }

  #close(): void {
    this.isVisible.set(false);
  }

  #openDrawer(drawerRef: InternalDrawer<unknown>): void {
    this.drawerRef.set(drawerRef);

    if (this.drawerRef() && this.drawerRef()!.component && this.container()) {
      this.container().viewContainer.clear();
      this.title.set(drawerRef.title);
      this.#component.set(
        this.container().viewContainer.createComponent(
          this.drawerRef()!.component,
          {
            bindings: this.#getInputs(),
          }
        )
      );
    }
    this.isVisible.set(true);
  }

  #getInputs(): Binding[] {
    return this.drawerRef()!.inputs.map(([key, value]) => inputBinding(key, () => value)).concat([inputBinding('drawerRef', () => this.drawerRef())]);
  }

}
