import { Component, inject, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from "primeng/menu";
import { Dialog } from "@shared/components/dialog/dialog";
import { FormsModule } from '@angular/forms';
import { SiteManager } from "../site-manager/site-manager";
import { SpaceService } from "@core/services/space.service";
import { Site } from '@core/index';

@Component({
  selector: 'hta-site-dropdown',
  imports: [FormsModule, Menu, Dialog, SiteManager],
  templateUrl: './site-dropdown.html',
  styleUrl: './site-dropdown.css',
})
export class SiteDropdown implements OnInit {
  show = signal(false);
  isEditing = signal(false);
  isFormOpen = signal(false);

  #siteService = inject<SpaceService>(SpaceService);

  sites = signal<Site[]>([
    { siteId: '1', name: 'Casa Principal', icon: 'pi pi-home', address: 'Av. Libertador 1234' },
    { siteId: '2', name: 'Oficina Centro', icon: 'pi pi-building', address: 'San Martín 400' }
  ]);

  currentSite = this.sites()[0];

  siteTypes = [
    { label: 'Casa', icon: 'pi pi-home', value: 'house' },
    { label: 'Depto', icon: 'pi pi-building', value: 'apartment' },
    { label: 'Oficina', icon: 'pi pi-briefcase', value: 'office' }
  ];

  siteForm = { id: 0, name: '', icon: 'pi pi-home', address: '' };

  siteMenuItems: MenuItem[] = [];

  ngOnInit() {
    this.#siteService.getAll().subscribe((sites: Site[]) => this.sites.set(sites));
    this.updateMenu();
  }

  updateMenu() {
    this.siteMenuItems = [
      {
        label: 'MIS SITIOS',
        items: this.sites().map(site => ({
          label: site.name,
          icon: site.icon,
          styleClass: site.siteId === this.currentSite.siteId ? 'font-bold text-orange-600' : '',
          command: () => this.selectSite(site)
        }))
      },
      { separator: true },
      {
        label: 'Gestionar Inmuebles',
        icon: 'pi pi-cog',
        command: () => {
          this.show.set(true);
          this.isEditing.set(false);
        }
      }
    ];
  }

  selectSite(site: any) {
    this.currentSite = site;
    this.updateMenu(); // Para actualizar el check visual
    this.show.set(false);

    // AQUÍ: Disparar evento a tu SiteService para recargar la app
    // this.siteService.setActiveSite(site.id);
    console.log('Cambiado a:', site.name);
  }

  // CRUD LÓGICA
  resetForm() {
    this.siteForm = { id: 0, name: '', icon: 'pi-home', address: '' };
    this.isEditing.set(false);
  }

  editSite(site: any) {
    this.siteForm = { ...site };
    this.isEditing.set(true);
    this.isFormOpen.set(true);
  }


}
