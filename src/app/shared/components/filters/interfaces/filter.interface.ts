import { DropdownOption } from "@shared/abstractions/dropdown/dropdown-option";
import { Observable } from "rxjs";

export type FilterType = 'text' | 'dropdown' | 'multi-select';

export interface Filter {
    name?: string;
    label: string;
    type: FilterType;
    source?: Observable<DropdownOption[]>;
    defaultValue?: unknown;
}