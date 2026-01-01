import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TranslateService } from '@ngx-translate/core';
import { HestiaBrand } from '@shared/components/hestia-brand/hestia-brand';

@Component({
  selector: 'hta-navbar',
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule, BadgeModule, RippleModule, HestiaBrand, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  items: (MenuItem & { routerLinkActiveOptions?: { exact: boolean } })[] | undefined;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.buildMenu();
    this.translate.onLangChange.subscribe(() => {
      this.buildMenu();
    });
  }

  buildMenu() {
    this.items = [
      {
        label: this.translate.instant('MENU.MAIN'),
        items: [
          {
            label: this.translate.instant('MENU.DASHBOARD'),
            icon: 'pi pi-home',
            routerLink: '/app/dashboard'
          },
          {
            label: this.translate.instant('MENU.MY_SPACES'),
            icon: 'pi pi-th-large',
            routerLink: '/app/espacios'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: this.translate.instant('MENU.DEVICES'),
        items: [
          {
            label: this.translate.instant('MENU.SUMMARY'),
            icon: 'pi pi-list',
            routerLink: '/app/dispositivos',
            routerLinkActiveOptions: { exact: true }
          },
          {
            label: this.translate.instant('MENU.LIGHTING'),
            icon: 'pi pi-lightbulb',
            routerLink: '/app/dispositivos/iluminacion'
          },
          {
            label: this.translate.instant('MENU.CLIMATE'),
            icon: 'pi pi-cloud',
            routerLink: '/app/dispositivos/clima'
          },
          {
            label: this.translate.instant('MENU.SECURITY'),
            icon: 'pi pi-shield',
            routerLink: '/app/dispositivos/seguridad'
          },
          {
            label: this.translate.instant('MENU.ENERGY'),
            icon: 'pi pi-bolt',
            routerLink: '/app/dispositivos/energia'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: this.translate.instant('MENU.MANAGEMENT'),
        items: [
          {
            label: this.translate.instant('MENU.AUTOMATION'),
            icon: 'pi pi-cog',
            routerLink: '/app/automatizacion'
          },
          {
            label: this.translate.instant('MENU.ANALYTICS'),
            icon: 'pi pi-chart-bar',
            routerLink: '/app/analitica'
          }
        ]
      },
      {
        separator: true
      },
      {
        label: this.translate.instant('MENU.ACCOUNT'),
        items: [
          {
            label: this.translate.instant('MENU.SETTINGS'),
            icon: 'pi pi-sliders-h',
            routerLink: '/app/configuracion'
          }
        ]
      }
    ];
  }
}
