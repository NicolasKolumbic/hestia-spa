import { ComponentRef, Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[htaViewContainer]'
})
export class ViewContainer {
  viewContainer = inject(ViewContainerRef);

  insert<T>(component: ComponentRef<T>) {
    this.viewContainer.clear();
    this.viewContainer.insert(component.hostView);
  }

}
