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
      .pipe(tap((sites) => this.#buildMenuItems(sites)))
      .subscribe((sites: Site[]) => {
        this.sites.set(sites);
        this.#siteService.setSite(sites[0]);
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
    this.menuItems.set(menuItems)
    this.currentSite.set(menuItems[0]);
  }

  #getIcon(site: Site): string {
    if (site.icon === SiteTypeIcons.COMMERCIAL) {
      site.icon = 'store'
    } else if (site.icon === SiteTypeIcons.INDUSTRIAL) {
      site.icon = 'factory'
    } else if (site.icon === SiteTypeIcons.INSTITUCIONAL) {
      site.icon = 'account_balance'
    } else if (site.icon === SiteTypeIcons.RURAL) {
      site.icon = 'agriculture'
    } else {
      site.icon = 'house';
    }

    return site.icon;
  }

  selectSite(menuItem: MenuItem): void {
    this.currentSite.set(menuItem);
    this.show.set(false);
    const selectedItem = this.sites().find(site => site.siteId === menuItem.id);
    if (selectedItem) {
      this.#siteService.setSite(selectedItem);
    }
  }
}
