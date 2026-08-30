import { Component, inject, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from "primeng/menu";
import { Dialog } from "@shared/components/dialog/dialog";
import { FormsModule } from '@angular/forms';
import { SiteManager } from "../site-manager/site-manager";
import { SpaceService } from "@core/services/space.service";
import { Site } from '@core/index';
import { map, tap } from 'rxjs';
import { SiteTypeIcons } from '@shared/enums/site-type.enum';
import { Button } from "primeng/button";
import { MatIconModule } from '@angular/material/icon';
import { QueryResponse } from '@shared/abstractions/grid-response.dto';
import { SiteType } from '@core/enums/site-type.enum';


const LAST_SITE_KEY = 'hestia_last_site_id';

@Component({
  selector: 'hta-site-dropdown',
  imports: [FormsModule, Menu, Dialog, SiteManager, Button, MatIconModule],
  templateUrl: './site-dropdown.html',
  styleUrl: './site-dropdown.css',
})
export class SiteDropdown implements OnInit {
  show = signal(false);
  isEditing = signal(false);
  isFormOpen = signal(false);

  #siteService = inject<SpaceService>(SpaceService);

  menuItems = signal<MenuItem[]>([]);
  currentSite = signal<MenuItem | null>(null);
  sites = signal<Site[]>([]);

  siteTypes = [
    { label: 'Casa', icon: 'pi pi-home', value: 'house' },
    { label: 'Depto', icon: 'pi pi-building', value: 'apartment' },
    { label: 'Oficina', icon: 'pi pi-briefcase', value: 'office' }
  ];

  siteForm = { id: 0, name: '', icon: 'pi pi-home', address: '' };

  ngOnInit() {
    this.#siteService.getAll()
      .pipe(tap((response: QueryResponse<Site>) => this.#buildMenuItems(response.items)))
      .subscribe((response: QueryResponse<Site>) => {
        const sites = response.items;
        this.sites.set(sites);

        if (sites.length === 0) return;

        // 1. Recuperar el último sitio navegado desde localStorage
        const savedSiteId = localStorage.getItem(LAST_SITE_KEY);
        const matchedSite = sites.find((s) => s.siteId === savedSiteId);

        // 2. Si existe y el usuario tiene acceso, seleccionarlo; de lo contrario, el primero
        const initialSite = matchedSite ?? sites[0];
        const matchedMenuItem = this.menuItems().find((item) => item.id === initialSite.siteId) ?? this.menuItems()[0];

        this.currentSite.set(matchedMenuItem);
        this.#siteService.setSite(initialSite);
      });
  }

  #buildMenuItems(sites: Site[]): void {
    const menuItems = sites.map((site: Site) => {
      const item: MenuItem = {
        label: site.name,
        icon: this.#getIcon(site),
        id: site.siteId,
        styleClass: this.currentSite() && site.siteId === this.currentSite()!.id ? 'font-bold text-orange-600' : '',
      }
      item.command = () => this.selectSite(item);
      return item;
    });
    this.menuItems.set(menuItems);
  }

  #getIcon(site: Site): string {
    if (site.type === SiteType.COMMERCIAL) {
      return 'icon-building-office'
    } else if (site.type === SiteType.INDUSTRIAL) {
      return 'factory'
    } else if (site.type === SiteType.INSTITUTIONAL) {
      return 'account_balance'
    } else if (site.type === SiteType.RURAL) {
      return 'agriculture'
    } else {
      return 'house';
    }
  }

  selectSite(menuItem: MenuItem): void {
    this.currentSite.set(menuItem);
    this.show.set(false);
    const selectedItem = this.sites().find(site => site.siteId === menuItem.id);
    if (selectedItem) {
      localStorage.setItem(LAST_SITE_KEY, selectedItem.siteId);
      this.#siteService.setSite(selectedItem);
    }
  }
}
