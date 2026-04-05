import { WritableSignal } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ErrorMessages } from "../typings/error-messages";

export interface ControlAccessor<T> {
    touched(): ControlAccessor<T>;
    dirty(): ControlAccessor<T>;
    disabled(): ControlAccessor<T>;
    enabled(): ControlAccessor<T>;
    setValue(value: T | null): ControlAccessor<T>;
    setMessages(message: ErrorMessages): ControlAccessor<T>;
    checkErrors(): ControlAccessor<T>;
    control: WritableSignal<FormControl<T>>;
    isDisabled: WritableSignal<boolean>;
    value: WritableSignal<T | null>;
    hasErrors: WritableSignal<boolean>;
}