import { Component, input, OnInit } from '@angular/core';
import { UserInformation } from '@shared/abstractions/user-info/user-info';
import { Avatar } from 'primeng/avatar';
import { UserManagment } from 'src/app/features/private/access-managment/models/user-managment';

@Component({
  selector: 'hta-user-info',
  imports: [Avatar],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfo implements OnInit {
  user = input.required<UserManagment>();

  customStyle: Record<string, string> = {};

  ngOnInit(): void {
    const hashColor = this.#generateHslColor(this.user().initials);

    this.customStyle = {
      'background-color': hashColor,
    };
  }

  #generateHslColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 60%, 45%)`;
  }
}
