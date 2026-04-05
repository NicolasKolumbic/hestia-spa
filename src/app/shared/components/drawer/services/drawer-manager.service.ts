import { Injectable } from '@angular/core';
import { DrawerContext } from '../models/drawer-context';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DrawerSettings } from '../interfaces/drawer-settings';
import { DrawerRef } from '../interfaces/drawer-ref';
import { InternalDrawer } from '../interfaces/internal-drawer';

@Injectable({
  providedIn: 'root',
})
export class DrawerManagerService {
  #drawerTrigger$ = new Subject<InternalDrawer<unknown>>();
  #closeDrawer$ = new Subject<void>();
  #disablePrimaryButton$ = new BehaviorSubject<boolean>(false);
  #closed$ = new Subject<void>();

  get onDrawerOpen$(): Observable<InternalDrawer<unknown>> {
    return this.#drawerTrigger$.asObservable();
  }

  get onCloseDrawer$(): Observable<void> {
    return this.#closeDrawer$.asObservable();
  }

  constructor() { }

  open<T>(settings: DrawerSettings): DrawerRef<T> {
    const drawerRef = new DrawerContext<T>(settings);
    this.#drawerTrigger$.next(drawerRef)
    return drawerRef;
  }
}
