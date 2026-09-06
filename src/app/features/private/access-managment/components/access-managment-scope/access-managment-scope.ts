import { Component, input, output, model, signal } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { RolesDropdown } from "@core/components/roles-dropdown/roles-dropdown";
import { PermissionScope } from '@core/domain/models/permission-scope';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { UpdatePermissionRequestDto } from '../../interfaces/update-permission-request.dto';

@Component({
  selector: 'hta-access-managment-scope',
  imports: [
    FormsModule,
    TreeTableModule,
    TableModule,
    RolesDropdown,
  ],
  templateUrl: './access-managment-scope.html',
  styleUrl: './access-managment-scope.css',
})
export class AccessManagmentScope {
  nodes = input.required<PermissionScope[]>();
  selectedNodes = model<PermissionScope[]>([]);
  readonly = input<boolean>(false);

  updatedMembership = signal<UpdatePermissionRequestDto>({ toAdd: [], toDelete: [], toUpdate: [] });

  update = output<UpdatePermissionRequestDto>();

  updateRole(roleId: string | null, node: PermissionScope) {

    node.roleId = roleId;
    if (!roleId) {
      this.#delete(node);
    } else if (node.assignmentId) {
      this.#update(node, roleId);
    } else {
      this.#add(node);
    }
    this.update.emit(this.updatedMembership());
  }

  #delete(node: PermissionScope): void {
    node.checked = false;
    const accumulated = this.updatedMembership()?.toDelete ?? [];

    if (node.assignmentId) {
      this.updatedMembership.update((request) => ({
        ...request,
        toDelete: [...accumulated, node.assignmentId!]
      }));
    }

    this.selectedNodes.update((nodes) => {
      return nodes.filter((n) => n.key !== node.key);
    });
  }

  #update(node: PermissionScope, roleId: string): void {
    node.checked = true;
    const accumulated = this.updatedMembership()?.toUpdate ?? [];

    this.updatedMembership.update((request) => ({
      ...request,
      toUpdate: [...accumulated, { assignmentId: node.assignmentId!, roleId: roleId }]
    }));
    this.selectedNodes.update((nodes) => {
      const exists = nodes.some((n) => n.key === node.key);
      if (exists) {
        return nodes.map((n) => {
          if (n.key === node.key) {
            return node;
          }
          return n;
        });
      }
      return [...nodes, node];
    });
  }

  #add(node: PermissionScope): void {
    node.checked = true;
    const accumulated = this.updatedMembership()?.toAdd ?? [];

    this.updatedMembership.update((request) => ({
      ...request,
      toAdd: [...accumulated, { roleId: node.roleId!, scopeId: node.targetId!, scopeType: node.type! }]
    }));
    this.selectedNodes.update((nodes) => {
      const exists = nodes.some((n) => n.key === node.key);
      if (exists) {
        return nodes.map((n) => {
          if (n.key === node.key) {
            return node;
          }
          return n;
        });
      }
      return [...nodes, node];
    });
  }
}
