import { signal } from "@angular/core";
import { Observable, Subscription } from "rxjs";

export class ButtonState {
    #isDisabled = signal(false);
    #disabledSubscription?: Subscription;

    readonly isDisabled = this.#isDisabled.asReadonly();

    constructor(initialState: { disabled?: boolean } = {}) {
        this.#isDisabled.set(!!initialState.disabled);
    }

    link(observable: Observable<boolean>) {
        this.#disabledSubscription?.unsubscribe();
        this.#disabledSubscription = observable.subscribe((value) => {
            this.#isDisabled.set(value);
        });
    }

    disable(): void {
        this.#isDisabled.set(true);
    }

    enable(): void {
        this.#isDisabled.set(false);
    }

    destroy(): void {
        this.#disabledSubscription?.unsubscribe();
    }
}