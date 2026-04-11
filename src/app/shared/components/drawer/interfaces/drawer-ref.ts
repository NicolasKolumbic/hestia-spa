import { ButtonState } from "@shared/components/button/models/button-state";
import { LinkToObserver } from "@shared/helpers/link-to-observer";
import { Observable } from "rxjs";

export interface DrawerRef<TResult = unknown> {
    confirmed(): Observable<TResult>;
    close(): Observable<void>;
    getData(fn: () => TResult): void;
    beforeClose: LinkToObserver<boolean>;
    confirmButton: ButtonState;
    cancelButton: ButtonState;
}