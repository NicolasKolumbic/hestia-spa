import { Type } from "@angular/core";
import { DrawerBody } from "./drawer-body";
import { DrawerRef } from "./drawer-ref";

export interface InternalDrawer<TResult> extends DrawerRef<TResult> {
    title: string;
    hideCloseButton: boolean;
    hideFooterButtons: boolean;
    component: Type<DrawerBody>;
    inputs: [string, unknown][];
    emit(): void;
}