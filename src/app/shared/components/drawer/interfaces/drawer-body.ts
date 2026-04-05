import { InputSignal } from "@angular/core";
import { DrawerRef } from "./drawer-ref";

export interface DrawerBody {
    drawerRef: InputSignal<DrawerRef>;
}