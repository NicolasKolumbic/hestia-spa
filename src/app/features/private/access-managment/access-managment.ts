import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { UserStatus } from './typings/user-status.type';
import { RoleCode } from './typings/role-code.type';
import { USER_STATUS_LABELS } from './static/user-status.labels';
import { SCOPE_TYPE_LABELS } from './static/scope-type.labels';
import { ROLE_LABELS } from './static/role.labels';
import { ScopeType } from './typings/scope.type';
import { ScopeNodeData } from './interfaces/scope-node-data.interface';
import { InviteForm } from './interfaces/invite-form.interface';
import { SearchField } from "@shared/components/search-field/search-field";
import { Button } from "@shared/components/button/button";
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { Filters } from "@shared/components/filters/filters";
import { Filter } from '@shared/components/filters/interfaces/filter.interface';
import { of } from 'rxjs';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { AccessManagmentService } from './services/access-managment.service';
import { GridResponse } from '@core/domain/interfaces/grid-response.interface';
import { UserAccess } from './interfaces/user-access.interface';
import { UserManagment } from './models/user-managment';
import { AccessManagmentCard } from "./components/access-managment-card/access-managment-card";
import { CardsGrid } from "@shared/components/cards-grid/cards-grid";
import { SpaceService } from '@core/index';
import { TopologyNodeDto } from '@core/domain/dtos/topology-node.dto';
import { UserDetailForm } from './components/user-detail-form/user-detail-form';

@Component({
  selector: 'hta-access-managment',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TabsModule,
    TagModule,
    ToolbarModule,
    TreeModule,
    SearchField,
    Button,
    SectionWrapper,
    Filters,
    AccessManagmentCard,
    CardsGrid
  ],
  templateUrl: './access-managment.html',
  styleUrl: './access-managment.css',
})
export class AccessManagment {
  users = signal<UserManagment[]>([]);
  permissions = signal<TopologyNodeDto[]>([]);

  selectedUserDraft: UserAccess | null = null;
  selectedMembershipId: string | null = null;

  searchTerm = '';
  selectedStatuses: UserStatus[] = [];
  selectedRoles: RoleCode[] = [];
  selectedScopeTypes: ScopeType[] = [];

  selectedScopeNode: TreeNode<ScopeNodeData> | null = null;

  inviteScopeNode: TreeNode<ScopeNodeData> | null = null;
  inviteForm: InviteForm = {
    fullName: '',
    email: '',
    role: 'viewer',
    scopeType: 'CLIENT',
  };

  #drawerManager = inject(DrawerManagerService);
  #accessManagmentService = inject(AccessManagmentService);
  #siteService = inject(SpaceService);

  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Inactivo', value: 'inactive' },
    { label: 'Revocado', value: 'revoked' },
  ] satisfies DropdownOption[];

  scopeTypeOptions = [
    { label: 'Cliente', value: 'CLIENT' },
    { label: 'Sitio', value: 'SITE' },
    { label: 'Zona', value: 'ZONE' },
    { label: 'Dispositivo', value: 'DEVICE' },
  ] satisfies DropdownOption[];

  roleOptions = [
    { label: 'Owner', value: 'owner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Operator', value: 'operator' },
    { label: 'Viewer', value: 'viewer' },
    { label: 'Technician', value: 'technician' },
    { label: 'Security Monitor', value: 'security_monitor' },
  ] satisfies DropdownOption[];

  filters: Filter[] = [
    {
      label: 'Estado',
      type: 'multi-select',
      source: of(this.statusOptions),
    },
    {
      label: 'Rol',
      type: 'multi-select',
      source: of(this.roleOptions),
    },
    {
      label: 'Tipo de scope',
      type: 'multi-select',
      source: of(this.scopeTypeOptions),
    },
  ];

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatuses = [];
    this.selectedRoles = [];
    this.selectedScopeTypes = [];
  }

  saveAccessChanges(): void {
    if (!this.selectedUserDraft) return;
  }

  openInviteDialog(): void {
    const newUser = this.#drawerManager.open({
      component: UserDetailForm,
      title: 'Invitar usuario',
    });

    newUser.confirmed().subscribe((user) => {
      console.log(user);
    });
  }


  inviteSummary(): string {
    const selectedNode = this.inviteScopeNode?.data;
    const userName = this.inviteForm.fullName || 'El usuario';
    const role = this.roleLabel(this.inviteForm.role);
    const scope = selectedNode?.label || 'Cliente completo · Familia Pérez';

    return `${userName} tendrá acceso como ${role} sobre ${scope}.`;
  }

  /*membershipOptions(user: UserAccess): Array<{ label: string; value: string }> {
    return user.memberships.map((membership) => ({
      label: `${membership.clientName} · ${this.statusLabel(membership.status)}`,
      value: membership.id,
    }));
  }

  currentMembership(user: UserAccess): Membership | undefined {
    return user.memberships.find((membership) => membership.id === this.selectedMembershipId) ?? user.memberships[0];
  }*/

  addAssignmentToCurrentMembership(): void {
    if (!this.selectedUserDraft || !this.selectedMembershipId || !this.selectedScopeNode?.data) return;

    /*const membership = this.currentMembership(this.selectedUserDraft);
    if (!membership) return;

    const scopeData = this.selectedScopeNode.data;
    const alreadyExists = membership.assignments.some(
      (assignment) =>
        assignment.role === this.draftRole
        && assignment.scopeType === this.draftScopeType
        && assignment.scopeId === scopeData.id,
    );

    if (alreadyExists) return;

    membership.assignments.push({
      id: crypto.randomUUID(),
      role: this.draftRole,
      scopeType: this.draftScopeType,
      scopeId: scopeData.id,
      scopeLabel: scopeData.label,
    });*/
  }

  removeAssignment(assignmentId: string): void {
    if (!this.selectedUserDraft) return;

    /* const membership: Membership | undefined = this.currentMembership(this.selectedUserDraft);
     if (!membership) return;*/

    //membership.assignments = membership.assignments.filter((assignment) => assignment.id !== assignmentId);
  }

  onScopeNodeSelected(event: { node: TreeNode<ScopeNodeData> }): void {
    const data = event.node.data;
  }

  onInviteScopeSelected(event: { node: TreeNode<ScopeNodeData> }): void {
    const data = event.node.data;
    if (data) {
      this.inviteForm.scopeType = data.type;
    }
  }

  effectivePermissionsByModule(user: UserAccess): Record<string, string[]> {
    const modules: Record<string, Set<string>> = {};

    /*for (const membership of user.memberships) {
      for (const assignment of membership.assignments) {
        const permissions = ROLE_PERMISSION_MAP[assignment.role] ?? [];

        for (const permission of permissions) {
          const [moduleName] = permission.split('.');
          if (!modules[moduleName]) {
            modules[moduleName] = new Set<string>();
          }
          modules[moduleName].add(permission);
        }
      }
    }*/

    return Object.entries(modules).reduce<Record<string, string[]>>((acc, [moduleName, permissions]) => {
      acc[moduleName] = Array.from(permissions);
      return acc;
    }, {});
  }

  permissionModules(permissionsByModule: Record<string, string[]>): string[] {
    return Object.keys(permissionsByModule);
  }



  roleLabel(role: RoleCode): string {
    return ROLE_LABELS[role];
  }

  scopeTypeLabel(scopeType: ScopeType): string {
    return SCOPE_TYPE_LABELS[scopeType];
  }

  statusLabel(status: UserStatus): string {
    return USER_STATUS_LABELS[status];
  }



  ngOnInit(): void {
    this.#accessManagmentService.listUsers({}).subscribe((response: GridResponse<UserManagment>) => {
      this.users.set(response.items);
    });
  }

}
