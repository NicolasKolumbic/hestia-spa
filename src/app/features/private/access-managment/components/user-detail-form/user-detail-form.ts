import { Component, input, InputSignal } from '@angular/core';
import { Avatar } from "primeng/avatar";
import { Tag } from "primeng/tag";
import { Dropdown } from "@shared/components/dropdown/dropdown";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { DrawerBody } from '@shared/components/drawer/interfaces/drawer-body';
import { DrawerRef } from '@shared/components/drawer/interfaces/drawer-ref';
import { Card } from "@shared/components/card/card";
import { Button } from "@shared/components/button/button";
import { UserDetailSummary } from "../user-detail-summary/user-detail-summary";
import { InviteUserRoleAndScope } from "../invite-user-role-and-scope/invite-user-role-and-scope";
import { InviteUserPermission } from "../invite-user-permission/invite-user-permission";


@Component({
  selector: 'hta-user-detail-form',
  imports: [
    Avatar,
    Tag,
    Button,
    Dropdown,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    UserDetailSummary,
    InviteUserRoleAndScope,
    InviteUserPermission
  ],
  templateUrl: './user-detail-form.html',
  styleUrl: './user-detail-form.css',
})
export class UserDetailForm implements DrawerBody {
  drawerRef = input.required<DrawerRef<unknown>>();
}
