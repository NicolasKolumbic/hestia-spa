import { DropdownOption } from "@shared/abstractions/dropdown/dropdown-option";
import { Observable } from "rxjs";

export interface Filter {
    label: string;
    type: 'text' | 'dropdown' | 'multi-select';
    source?: Observable<DropdownOption[]>;
    defaultValue?: string;
}