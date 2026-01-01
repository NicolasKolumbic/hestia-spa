import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Navbar } from '../navbar/navbar';
import { AvatarModule } from "primeng/avatar";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { filter, startWith, map, switchMap } from 'rxjs';

@Component({
  selector: 'hta-dashboard-layout',
  imports: [Navbar, RouterOutlet, AvatarModule, OverlayBadgeModule, CommonModule, TranslateModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {
  pageTitle = signal<string>('');

  private routeMap: { [key: string]: string } = {
    '/app/dashboard': 'SECTIONS.DASHBOARD',
    '/app/espacios': 'SECTIONS.SPACES',
    '/app/dispositivos': 'SECTIONS.DEVICES',
    '/app/dispositivos/iluminacion': 'SECTIONS.LIGHTING',
    '/app/dispositivos/clima': 'SECTIONS.CLIMATE',
    '/app/dispositivos/seguridad': 'SECTIONS.SECURITY',
    '/app/dispositivos/energia': 'SECTIONS.ENERGY',
    '/app/automatizacion': 'SECTIONS.AUTOMATION',
    '/app/analitica': 'SECTIONS.ANALYTICS',
    '/app/configuracion': 'SECTIONS.SETTINGS'
  };

  constructor(private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url: string) => this.getKey(url)),
      switchMap(key => this.translate.stream(key))
    ).subscribe(title => {
      this.pageTitle.set(title);
    });
  }

  private getKey(url: string): string {
    const cleanUrl = url.split('?')[0];
    if (this.routeMap[cleanUrl]) {
      return this.routeMap[cleanUrl];
    }
    if (cleanUrl.startsWith('/app/espacios/')) {
      return 'SECTIONS.SPACES';
    }
    return 'Hestia';
  }
}
