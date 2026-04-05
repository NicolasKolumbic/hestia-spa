import { Component, inject, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SiteDropdown } from "@shared/bussiness/site-dropdown/site-dropdown";
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/domain/models/user';
import { Menu } from "primeng/menu";
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'hta-header',
  imports: [AvatarModule, OverlayBadgeModule, SiteDropdown, Menu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  #auth = inject(AuthService);
  #router = inject(Router);

  user = signal<User | null>(null);
  items: MenuItem[] = [
    {
      label: 'Cerrar Sessión',
      icon: 'pi pi-sign-out',
      command: () => this.#auth.logout().subscribe(() => this.#router.navigate(['/auth/login']))
    }
  ]

  constructor() {
    this.user.set(this.#auth.user);
  }
}
