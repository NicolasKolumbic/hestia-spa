import { Component } from '@angular/core';

@Component({
  selector: 'hta-invite-user-permission',
  imports: [],
  templateUrl: './invite-user-permission.html',
  styleUrl: './invite-user-permission.css',
})
export class InviteUserPermission {
  categories = ['USERS', 'SITES', 'ZONES', 'DEVICES']

}
