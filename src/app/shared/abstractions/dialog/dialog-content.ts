import { FormGroup } from "@angular/forms";

export interface DialogContent {
    getData<T>(): T;
    getForm(): FormGroup;
    isInvalid(): boolean;
}