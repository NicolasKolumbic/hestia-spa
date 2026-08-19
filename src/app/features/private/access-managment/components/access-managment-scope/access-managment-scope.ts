import { Component, input, signal } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { RolesDropdown } from "@core/components/roles-dropdown/roles-dropdown";
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { PermissionScope } from '@core/domain/models/permission-scope';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { JsonPipe } from '@angular/common';

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

  updateRole(roleId: string, node: PermissionScope) {
    node.data.roleId = roleId;
    this.selectedNodes.update((nodes) => [...nodes, node]);
  }
}
