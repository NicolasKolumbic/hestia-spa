export interface TopologyNodeDto {
    key: string;      // Ej: "SITE:uuid" o "ZONE:uuid"
    label: string;    // Nombre visible (Casa, Living, etc.)
    data: {
        id: string;
        type: 'SITE' | 'ZONE' | 'DEVICE';
    };
    icon?: string;
    children?: TopologyNodeDto[];
    selectable?: boolean;
}