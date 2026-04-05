import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { AccessUser } from './interfaces/access-user.interface';
import { ROLE_PERMISSION_MAP } from './static/role-permission.map';
import { ScopeNodeData } from './interfaces/scope-node-data.interface';
import { Membership } from './interfaces/membership.interface';
import { InviteForm } from './interfaces/invite-form.interface';
import { MOCK_SCOPE_TREE, MOCK_USERS } from './static/test';
import { SearchField } from "@shared/components/search-field/search-field";
import { Button } from "@shared/components/button/button";
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { UserDetailForm } from './components/user-detail-form/user-detail-form';
import { InviteUserForm } from './components/invite-user-form/invite-user-form';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { Card } from "@shared/components/card/card";
import { Filters } from "@shared/components/filters/filters";
import { Filter } from '@shared/components/filters/interfaces/filter.interface';
import { of } from 'rxjs';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';

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
    Card,
    Filters
  ],
  templateUrl: './access-managment.html',
  styleUrl: './access-managment.css',
})
export class AccessManagment {
  users: AccessUser[] = structuredClone(MOCK_USERS);

  drawerVisible = false;
  inviteDialogVisible = false;

  selectedUserDraft: AccessUser | null = null;
  selectedMembershipId: string | null = null;

  searchTerm = '';
  selectedStatuses: UserStatus[] = [];
  selectedRoles: RoleCode[] = [];
  selectedScopeTypes: ScopeType[] = [];

  draftRole: RoleCode = 'viewer';
  draftScopeType: ScopeType = 'CLIENT';
  selectedScopeNode: TreeNode<ScopeNodeData> | null = null;

  inviteScopeNode: TreeNode<ScopeNodeData> | null = null;
  inviteForm: InviteForm = {
    fullName: '',
    email: '',
    role: 'viewer',
    scopeType: 'CLIENT',
  };

  readonly scopeTree: TreeNode<ScopeNodeData>[] = structuredClone(MOCK_SCOPE_TREE);

  #drawerManager = inject(DrawerManagerService);

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

  get filteredUsers(): AccessUser[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.users.filter((user) => {
      const matchesSearch = !term
        || user.fullName.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term);

      const primaryRole = this.primaryRole(user);
      const primaryScopeType = this.primaryScopeType(user);

      const matchesStatus = this.selectedStatuses.length === 0 || this.selectedStatuses.includes(user.status);
      const matchesRole = this.selectedRoles.length === 0 || this.selectedRoles.includes(primaryRole);
      const matchesScope = this.selectedScopeTypes.length === 0 || this.selectedScopeTypes.includes(primaryScopeType);

      return matchesSearch && matchesStatus && matchesRole && matchesScope;
    });
  }

  get activeUsersCount(): number {
    return this.users.filter((user) => user.status === 'active').length;
  }

  get pendingUsersCount(): number {
    return this.users.filter((user) => user.status === 'pending').length;
  }

  get ownerUsersCount(): number {
    return this.users.filter((user) => this.primaryRole(user) === 'owner').length;
  }

  get operatorUsersCount(): number {
    return this.users.filter((user) => this.primaryRole(user) === 'operator').length;
  }

  get viewerUsersCount(): number {
    return this.users.filter((user) => this.primaryRole(user) === 'viewer').length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatuses = [];
    this.selectedRoles = [];
    this.selectedScopeTypes = [];
  }

  openUserDrawer(user: AccessUser): void {
    this.selectedUserDraft = structuredClone(user);
    this.selectedMembershipId = this.selectedUserDraft.memberships[0]?.id ?? null;
    this.resetAssignmentDraft();
    this.#drawerManager.open({
      component: UserDetailForm,
      title: 'Detalle de acceso',
    });
    //this.drawerVisible = true;

  }

  saveAccessChanges(): void {
    if (!this.selectedUserDraft) return;

    this.users = this.users.map((user) =>
      user.id === this.selectedUserDraft?.id ? structuredClone(this.selectedUserDraft) : user,
    );
  }

  openInviteDialog(): void {
    //this.inviteDialogVisible = true;
    this.inviteForm = {
      fullName: '',
      email: '',
      role: 'viewer',
      scopeType: 'CLIENT',
    };
    //this.inviteScopeNode = null;
    this.#drawerManager.open({
      component: InviteUserForm,
      title: 'Invitar usuario',
    });
  }

  inviteUser(): void {
    const selectedNode = this.inviteScopeNode?.data;
    const newUser: AccessUser = {
      id: crypto.randomUUID(),
      fullName: this.inviteForm.fullName || 'Nuevo usuario',
      email: this.inviteForm.email || 'nuevo@example.com',
      initials: this.buildInitials(this.inviteForm.fullName || 'Nuevo usuario'),
      status: 'pending',
      lastLoginAt: null,
      memberships: [
        {
          id: crypto.randomUUID(),
          clientId: 'client-familia-perez',
          clientName: 'Familia Pérez',
          status: 'pending',
          invitedBy: 'Nicolás Kolumbic',
          joinedAt: new Date().toISOString().slice(0, 10),
          assignments: [
            {
              id: crypto.randomUUID(),
              role: this.inviteForm.role,
              scopeType: selectedNode?.type ?? this.inviteForm.scopeType,
              scopeId: selectedNode?.id ?? 'client-familia-perez',
              scopeLabel: selectedNode?.label ?? 'Cliente completo · Familia Pérez',
            },
          ],
        },
      ],
    };

    this.users = [newUser, ...this.users];
    this.inviteDialogVisible = false;
  }

  inviteSummary(): string {
    const selectedNode = this.inviteScopeNode?.data;
    const userName = this.inviteForm.fullName || 'El usuario';
    const role = this.roleLabel(this.inviteForm.role);
    const scope = selectedNode?.label || 'Cliente completo · Familia Pérez';

    return `${userName} tendrá acceso como ${role} sobre ${scope}.`;
  }

  membershipOptions(user: AccessUser): Array<{ label: string; value: string }> {
    return user.memberships.map((membership) => ({
      label: `${membership.clientName} · ${this.statusLabel(membership.status)}`,
      value: membership.id,
    }));
  }

  currentMembership(user: AccessUser): Membership | undefined {
    return user.memberships.find((membership) => membership.id === this.selectedMembershipId) ?? user.memberships[0];
  }

  addAssignmentToCurrentMembership(): void {
    if (!this.selectedUserDraft || !this.selectedMembershipId || !this.selectedScopeNode?.data) return;

    const membership = this.currentMembership(this.selectedUserDraft);
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
    });

    this.resetAssignmentDraft();
  }

  removeAssignment(assignmentId: string): void {
    if (!this.selectedUserDraft) return;

    const membership: Membership | undefined = this.currentMembership(this.selectedUserDraft);
    if (!membership) return;

    membership.assignments = membership.assignments.filter((assignment) => assignment.id !== assignmentId);
  }

  onScopeNodeSelected(event: { node: TreeNode<ScopeNodeData> }): void {
    const data = event.node.data;
    if (data) {
      this.draftScopeType = data.type;
    }
  }

  onInviteScopeSelected(event: { node: TreeNode<ScopeNodeData> }): void {
    const data = event.node.data;
    if (data) {
      this.inviteForm.scopeType = data.type;
    }
  }

  effectivePermissionsByModule(user: AccessUser): Record<string, string[]> {
    const modules: Record<string, Set<string>> = {};

    for (const membership of user.memberships) {
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
    }

    return Object.entries(modules).reduce<Record<string, string[]>>((acc, [moduleName, permissions]) => {
      acc[moduleName] = Array.from(permissions);
      return acc;
    }, {});
  }

  permissionModules(permissionsByModule: Record<string, string[]>): string[] {
    return Object.keys(permissionsByModule);
  }

  primaryRole(user: AccessUser): RoleCode {
    return user.memberships[0]?.assignments[0]?.role ?? 'viewer';
  }

  primaryScopeType(user: AccessUser): ScopeType {
    return user.memberships[0]?.assignments[0]?.scopeType ?? 'CLIENT';
  }

  primaryScopeLabel(user: AccessUser): string {
    return user.memberships[0]?.assignments[0]?.scopeLabel ?? 'Sin scope';
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

  roleSeverity(role: RoleCode): 'success' | 'info' | 'warn' | 'contrast' | 'secondary' {
    switch (role) {
      case 'owner':
        return 'contrast';
      case 'admin':
        return 'warn';
      case 'operator':
        return 'success';
      case 'viewer':
        return 'info';
      case 'technician':
        return 'secondary';
      case 'security_monitor':
        return 'warn';
      default:
        return 'info';
    }
  }

  statusSeverity(status: UserStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warn';
      case 'inactive':
        return 'secondary';
      case 'revoked':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private resetAssignmentDraft(): void {
    this.draftRole = 'viewer';
    this.draftScopeType = 'CLIENT';
    this.selectedScopeNode = null;
  }

  private buildInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? '')
      .join('');
  }
}
