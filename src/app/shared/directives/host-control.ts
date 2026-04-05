import { ComponentRef, Directive, ElementRef, forwardRef, inject, Injector, OnDestroy, OnInit, Renderer2, signal, ViewContainerRef } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroup, NG_VALUE_ACCESSOR, NgControl, NgModel, ValidationErrors } from '@angular/forms';
import { OnChange } from '@shared/typings/onchange.type';
import { OnTouched } from '@shared/typings/onotuched.type';
import { ControlAccessor } from '../abstractions/control-accessor';
import { Environment } from '@core/services/environment';
import { ErrorMessages } from '../typings/error-messages';
import { Message } from 'primeng/message';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[htaHostControl]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HostControl),
      multi: true
    }
  ]
})
export class HostControl<T> implements ControlValueAccessor, OnInit, OnDestroy, ControlAccessor<T> {

  onChange: OnChange<T> = () => { };
  onTouched: OnTouched = () => { };

  #injector = inject(Injector);
  #environment = inject(Environment);
  #viewContainer = inject(ViewContainerRef);
  #renderer = inject(Renderer2);
  #el = inject(ElementRef);

  control = signal<FormControl<T>>(new FormControl());
  isDisabled = signal<boolean>(false);
  value = signal<T | null>(null);
  hasErrors = signal<boolean>(false);
  #messages = signal<ErrorMessages>({});

  #errorComponentRef: ComponentRef<Message> | null = null;
  #subscription?: Subscription;
  #defaultErrorMessage = "El campo tiene errores";

  constructor() { }

  ngOnInit() {
    const ngControl = this.#injector.get(NgControl, null, { self: true, optional: true });

    if (ngControl instanceof NgModel) {
      this.control.set(ngControl.control);
      ngControl.control.valueChanges.subscribe((value) => {
        if (ngControl.model !== value || ngControl.viewModel !== value) {
          ngControl.viewToModelUpdate(value);
        }
      });
    } else if (ngControl instanceof FormControlDirective) {
      this.control.set(ngControl.control);
    } else if (ngControl instanceof FormControlName) {
      const container = this.#injector.get(ControlContainer).control as FormGroup;
      const name = ngControl.name ? ngControl.name.toString() : '';
      this.control.set(container.controls[name] as FormControl);
    } else {
      if (!this.#environment.isProduction) {
        console.error(`
          El componente no tiene un NgControl
          `)
      }
    }
  }

  writeValue(value: T): void {
    this.value.set(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  checkErrors(): ControlAccessor<T> {
    if (this.#hasErrors()) {
      this.#showErrors();
    } else {
      this.#removeErrors();
    }
    return this;
  }

  touched(): ControlAccessor<T> {
    this.onTouched();
    return this;
  }

  dirty(): ControlAccessor<T> {
    if (this.control()) {
      this.control().markAsDirty();
    }
    return this;
  }

  disabled(): ControlAccessor<T> {
    if (this.control()) {
      this.control().disable();
    }

    return this
  }

  enabled(): ControlAccessor<T> {
    if (this.control()) {
      this.control().enable();
    }
    return this
  }

  setValue(value: T): ControlAccessor<T> {
    this.writeValue(value);

    if (this.onChange) {
      this.onChange(value);
    }

    return this
  }

  setMessages(messages: ErrorMessages): ControlAccessor<T> {
    this.#messages.set(messages);
    return this;
  }

  ngOnDestroy(): void {
    this.#subscription?.unsubscribe();
  }

  #hasErrors(): boolean {
    return this.control().invalid && (this.control().touched || this.control().dirty);
  }

  #showErrors(): void {
    if (!this.#errorComponentRef) {
      this.#viewContainer.clear();
      this.#errorComponentRef = this.#viewContainer.createComponent(Message);
      this.#renderer.appendChild(
        this.#el.nativeElement,
        this.#errorComponentRef.location.nativeElement
      );
    }

    this.#errorComponentRef.setInput('severity', 'error');
    this.#errorComponentRef.setInput('size', 'small');
    this.#errorComponentRef.setInput('variant', 'simple');
    this.#errorComponentRef.setInput('styleClass', 'flex justify-end mt-2');

    for (const errorKey of Object.keys(this.control().errors as ValidationErrors)) {
      this.#errorComponentRef.setInput('text', this.#getMessage(errorKey))
    }
  }

  #removeErrors(): void {
    if (this.#errorComponentRef) {
      this.#errorComponentRef.destroy();
      this.#errorComponentRef = null;
    }
  }

  #getMessage(errorKey: string): string {
    if (this.#messages()[errorKey]) {
      const messageObject = this.#messages()[errorKey];
      if (typeof messageObject === 'function') {
        return messageObject();
      } else {
        return messageObject;
      }
    }
    return this.#defaultErrorMessage;
  }

}
