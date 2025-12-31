import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { HestiaBrand } from '@shared/components/hestia-brand/hestia-brand';

@Component({
  selector: 'hta-navbar',
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule, BadgeModule, RippleModule, HestiaBrand, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  items: (MenuItem & { routerLinkActiveOptions?: { exact: boolean } })[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Principal',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: '/app/dashboard'
          },
          {
            label: 'Mis Espacios',
            icon: 'pi pi-th-large',
            routerLink: '/app/espacios'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Dispositivos',
        items: [
          {
            label: 'Resumen',
            icon: 'pi pi-list',
            routerLink: '/app/dispositivos',
            routerLinkActiveOptions: { exact: true }
          },
          {
            label: 'Iluminación',
            icon: 'pi pi-lightbulb',
            routerLink: '/app/dispositivos/iluminacion'
          },
          {
            label: 'Clima',
            icon: 'pi pi-cloud',
            routerLink: '/app/dispositivos/clima'
          },
          {
            label: 'Seguridad',
            icon: 'pi pi-shield',
            routerLink: '/app/dispositivos/seguridad'
          },
          {
            label: 'Energía',
            icon: 'pi pi-bolt',
            routerLink: '/app/dispositivos/energia'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Gestión',
        items: [
          {
            label: 'Automatización',
            icon: 'pi pi-cog',
            routerLink: '/app/automatizacion'
          },
          {
            label: 'Analítica',
            icon: 'pi pi-chart-bar',
            routerLink: '/app/analitica'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Cuenta',
        items: [
          {
            label: 'Configuración',
            icon: 'pi pi-sliders-h',
            routerLink: '/app/configuracion'
          }
        ]
      }
    ];
  }
}
