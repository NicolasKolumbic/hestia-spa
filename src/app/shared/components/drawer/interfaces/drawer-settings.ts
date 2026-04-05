import { Type } from "@angular/core";
import { DrawerBody } from "./drawer-body";

export interface DrawerSettings {
    title: string;
    component: Type<DrawerBody>;
    inputs?: Record<string, unknown>;
    hideCloseButton?: boolean;
    hideFooterButtons?: boolean;
}