import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'hta-site-manager',
  imports: [FormsModule, Button],
  templateUrl: './site-manager.html',
  styleUrl: './site-manager.css',
})
export class SiteManager {
  isFormOpen = signal(false);

  // DATA
  sites = [
    { id: 1, name: 'Casa Principal', icon: 'pi-home', address: 'Av. Libertador 1234' },
    { id: 2, name: 'Oficina Centro', icon: 'pi-building', address: 'San Martín 400' }
  ];

  currentSite = this.sites[0];

  // Tipos de inmuebles para el formulario
  siteTypes = [
    { label: 'Casa', icon: 'pi-home', value: 'house' },
    { label: 'Depto', icon: 'pi-building', value: 'apartment' },
    { label: 'Oficina', icon: 'pi-briefcase', value: 'office' }
  ];

  siteForm = { id: 0, name: '', icon: 'pi-home', address: '' };

  // MENÚ DEL DROPDOWN
  siteMenuItems: MenuItem[] = [];

  ngOnInit() {
    this.updateMenu();
  }

  updateMenu() {
    // Generamos el menú dinámicamente basado en los sitios disponibles
    this.siteMenuItems = [
      {
        label: 'MIS SITIOS',
        items: this.sites.map(site => ({
          label: site.name,
          icon: site.icon,
          styleClass: site.id === this.currentSite.id ? 'font-bold text-orange-600' : '',
          command: () => this.selectSite(site)
        }))
      },
      { separator: true },
      {
        label: 'Gestionar Inmuebles',
        icon: 'pi pi-cog',
        command: () => { }
      }
    ];
  }

  selectSite(site: any) {
    this.currentSite = site;
    this.updateMenu(); // Para actualizar el check visual

    // AQUÍ: Disparar evento a tu SiteService para recargar la app
    // this.siteService.setActiveSite(site.id);
    console.log('Cambiado a:', site.name);
  }

  // CRUD LÓGICA
  resetForm() {
    this.siteForm = { id: 0, name: '', icon: 'pi-home', address: '' };
  }

  editSite(site: any) {
    this.siteForm = { ...site };
    this.isFormOpen.set(true);
  }

  saveSite() {
    // if (this.isEditing()) {
    // Update logic
    const index = this.sites.findIndex(s => s.id === this.siteForm.id);
    this.sites[index] = { ...this.siteForm };
    //} else {
    // Create logic
    const newSite = { ...this.siteForm, id: Date.now() };
    this.sites.push(newSite);
    // Opcional: Cambiar automáticamente al nuevo sitio
    this.selectSite(newSite);
    //}
    // this.isEditing.set(false);
    // this.isFormOpen.set(false);
    // this.updateMenu();
  }

  deleteSite(site: any) {
    const index = this.sites.findIndex(s => s.id === site.id);
    this.sites.splice(index, 1);
    this.updateMenu();
    this.selectSite(this.sites[0]); // Cambiar al primer sitio si se eliminó el actual
  }
}
