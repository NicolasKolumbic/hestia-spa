import { Component, input, output, signal } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { RolesDropdown } from "@core/components/roles-dropdown/roles-dropdown";
import { PermissionScope } from '@core/domain/models/permission-scope';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

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
  readonly = input<boolean>(false);
  selectedNodes = signal<PermissionScope[]>([]);

  update = output<PermissionScope[]>();

  updateRole(roleId: string | null, node: PermissionScope) {
    node.data.roleId = roleId;
    if (roleId) {
      this.selectedNodes.update((nodes) => [...nodes, node]);
    } else {
      this.selectedNodes.update((nodes) => {
        return nodes.filter((n) => n.key !== node.key);
      });
    }
    this.update.emit(this.selectedNodes());
  }
}
