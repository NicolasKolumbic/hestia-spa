import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';

import { TwoFactorSetupComponent } from './two-factor-setup.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectButtonModule, ToggleSwitchModule, PasswordModule, TwoFactorSetupComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  activeTab = 'profile';

  menuItems = [
    { id: 'profile', label: 'Mi Perfil', icon: 'pi-user' },
    { id: 'home', label: 'Hogar y Miembros', icon: 'pi-home' },
    { id: 'integrations', label: 'Integraciones', icon: 'pi-link' },
    { id: 'preferences', label: 'Preferencias App', icon: 'pi-cog' },
    { id: 'security', label: 'Seguridad', icon: 'pi-shield' }
  ];

  members = [
    { name: 'Amy Elsner', role: 'Propietario', avatar: 'assets/avatar.jpg' },
    { name: 'Anna Fali', role: 'Invitado', avatar: 'assets/avatar-2.jpg' },
    { name: 'Asiya Javayant', role: 'Invitado', avatar: 'assets/avatar-3.jpg' }
  ];

  themeOptions = [
    { name: 'Claro', value: 'light' },
    { name: 'Oscuro', value: 'dark' },
    { name: 'Sistema', value: 'system' }
  ];
  selectedTheme = { name: 'Sistema', value: 'system' };

  notificationsEnabled = true;
  soundEnabled = false;

  twoFactorEnabled = false;

  sessions = [
    {
      id: 1,
      type: 'desktop',
      name: 'Chrome en Windows',
      location: 'Rosario, AR',
      lastActive: 'Ahora',
      current: true
    },
    {
      id: 2,
      type: 'mobile',
      name: 'iPhone 13 Pro',
      location: 'Rosario, AR',
      lastActive: 'Hace 2 horas',
      current: false
    },
    {
      id: 3,
      type: 'desktop',
      name: 'Safari en MacBook Air',
      location: 'Buenos Aires, AR',
      lastActive: 'Hace 5 días',
      current: false
    }
  ];
}
