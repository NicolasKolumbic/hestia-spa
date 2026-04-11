import { Observable, Subject } from "rxjs";
import { DrawerSettings } from "../interfaces/drawer-settings";
import { ButtonState } from "../../button/models/button-state";
import { LinkToObserver } from "@shared/helpers/link-to-observer";
import { InternalDrawer } from "../interfaces/internal-drawer";

export class DrawerContext<TResult> implements InternalDrawer<TResult> {
    #confirm = new Subject<TResult>();
    #settings: DrawerSettings;
    #close = new Subject<void>();
    #confirmButton = new ButtonState();
    #cancelButton = new ButtonState();
    #beforeClose = new LinkToObserver<boolean>();
    #getData: () => TResult = () => undefined as TResult;

    get title(): string {
        return this.#settings.title;
    }

    get hideCloseButton(): boolean {
        return !!this.#settings.hideCloseButton;
    }

    get hideFooterButtons(): boolean {
        return !!this.#settings.hideFooterButtons;
    }

    get component() {
        return this.#settings.component;
    }

    get inputs() {
        return Object.entries(this.#settings.inputs ?? {});
    }

    get confirmButton(): ButtonState {
        return this.#confirmButton;
    }

    get cancelButton(): ButtonState {
        return this.#cancelButton;
    }

    get beforeClose(): LinkToObserver<boolean> {
        return this.#beforeClose;
    }

    constructor(settings: DrawerSettings) {
        this.#settings = settings;
    }

    emit(): void {
        const data = this.#getData();
        this.#confirm.next(data);
    }

    close(): Observable<void> {
        return this.#close;
    }

    confirmed(): Observable<TResult> {
        return this.#confirm;
    }

    getData(fn: () => TResult): void {
        this.#getData = fn;
    }

}