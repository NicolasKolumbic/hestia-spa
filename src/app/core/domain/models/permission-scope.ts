import { ScopeType } from "@features/private/access-managment/typings";
import { TopologyNodeDto } from "../dtos/topology-node.dto";
import { PermissionDto } from "@features/private/access-managment/interfaces/permission-dto";

export class PermissionScope {
    assignmentId?: string;
    key: string;
    label: string;
    targetId?: string;
    type?: ScopeType;
    roleId: string | null;
    icon?: string;
    children?: PermissionScope[];
    checked?: boolean;
    selectable?: boolean;

    constructor({ key, label, data: { id, type }, selectable, children, icon }: TopologyNodeDto) {
        this.key = key;
        this.label = label;
        this.targetId = id;
        this.type = type;
        this.roleId = null;
        this.checked = selectable;
        this.children = children?.map(child => new PermissionScope(child));
        this.icon = icon;
        this.selectable = true;
    }

    toRequestDto(): PermissionDto {
        return {
            scopeType: this.type!,
            scopeId: this.targetId!,
            roleId: this.roleId!,
        };
    }
}