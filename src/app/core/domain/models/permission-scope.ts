import { UserPermissionRequestDto } from "../dtos/permission-request.dto";
import { TopologyNodeDto } from "../dtos/topology-node.dto";

export class PermissionScope {
    key: string;
    label: string;
    data: {
        id: string;
        type: 'SITE' | 'ZONE' | 'DEVICE';
        roleId?: string;
    };
    icon?: string;
    children?: PermissionScope[];
    selectable?: boolean;

    constructor({ key, label, data: { id, type }, selectable, children }: TopologyNodeDto) {
        this.key = key;
        this.label = label;
        this.data = { id, type, roleId: '' };
        this.selectable = selectable;
        this.children = children?.map(child => new PermissionScope(child));
    }

    get isValid(): boolean {
        return this.data.roleId !== '' && this.data.id !== '';
    }

    toRequestDto(): UserPermissionRequestDto {
        return {
            type: this.data.type,
            resourceId: this.data.id,
            roleId: this.data.roleId!,
        };
    }
}