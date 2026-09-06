import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
import { TopologyNodeDto } from '@core/domain/dtos/topology-node.dto';
import { UserDetailForm } from './components/user-detail-form/user-detail-form';
import { InviteUserPayload } from './interfaces/invite-user-payload.interface';

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

  filter = signal({
    searchTerm: '',
    selectedStatuses: [] as UserStatus[],
    selectedRoles: [] as RoleCode[],
    selectedScopeTypes: [] as ScopeType[],
  });

  selectedScopeNode: TreeNode<ScopeNodeData> | null = null;

  inviteScopeNode: TreeNode<ScopeNodeData> | null = null;
  inviteForm: InviteForm = {
    fullName: '',
    email: '',
    role: 'viewer',
    scopeType: 'CLIENT',
  };

  filterChanged = computed(() => {
    const { searchTerm, selectedRoles, selectedScopeTypes, selectedStatuses } = this.filter();
    this.#accessManagmentService.listUsers({
      search: searchTerm,
      roleCode: selectedRoles,
      scopeType: selectedScopeTypes,
      status: selectedStatuses,
    }).subscribe((response: GridResponse<UserManagment>) => {
      this.onRefresh(response);
    });
  })

  #drawerManager = inject(DrawerManagerService);
  #accessManagmentService = inject(AccessManagmentService);

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
      name: 'status',
      label: 'Estado',
      type: 'multi-select',
      source: of(this.statusOptions),
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'multi-select',
      source: of(this.roleOptions),
    },
    {
      name: 'scopeType',
      label: 'Tipo de scope',
      type: 'multi-select',
      source: of(this.scopeTypeOptions),
    },
  ];


  ngOnInit(): void {
    this.#accessManagmentService.listUsers({}).subscribe((response: GridResponse<UserManagment>) => {
      this.onRefresh(response);
    });
  }

  clearFilters(): void {
    this.filter.set({
      searchTerm: '',
      selectedStatuses: [],
      selectedRoles: [],
      selectedScopeTypes: [],
    });
  }

  openInviteDialog(): void {
    const newUser = this.#drawerManager.open<InviteUserPayload>({
      component: UserDetailForm,
      title: 'Invitar usuario',
    });

    newUser.confirmed().subscribe((user: InviteUserPayload) => {
      this.#accessManagmentService.inviteUser(user).subscribe((response: GridResponse<UserManagment>) => {
        this.onRefresh(response);
      });
    });
  }

  onRefresh(response: GridResponse<UserManagment>): void {
    this.users.set(response.items);
  }

  updateFilterHandler({ role, status, scopeType }: { role: RoleCode[], status: UserStatus[], scopeType: ScopeType[] }): void {
    this.filter.update((filter) => ({
      ...filter,
      selectedStatuses: status ?? [],
      selectedRoles: role ?? [],
      selectedScopeTypes: scopeType ?? [],
    }));
  }
}
