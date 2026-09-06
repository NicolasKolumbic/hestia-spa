import { ScopeType } from "@features/private/access-managment/typings";

export interface TopologyNodeDto {
    key: string;      // Ej: "SITE:uuid" o "ZONE:uuid"
    label: string;    // Nombre visible (Casa, Living, etc.)
    data: {
        id: string;
        type: ScopeType;
    }
    icon?: string;
    children?: TopologyNodeDto[];
    selectable?: boolean;
}