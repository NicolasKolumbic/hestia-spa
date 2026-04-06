import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  constructor(@Inject(DOCUMENT) private document: Document) { }

  get nativeWindow(): Window {
    return this.document.defaultView || window;
  }
}