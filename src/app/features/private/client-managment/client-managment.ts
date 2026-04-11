import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from "@shared/components/button/button";
import { Tag } from "primeng/tag";
import { Tooltip } from 'primeng/tooltip';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { Card } from "@shared/components/card/card";
import { ClientsService } from '@core/services/clients-service';
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { ClientForm } from './components/client-form/client-form';
import { CardsGrid } from "@shared/components/cards-grid/cards-grid";
import { InviteUserForm } from '../access-managment/components/invite-user-form/invite-user-form';
import { iif } from 'rxjs';
import { Client } from '@core/domain/models/client';
import { ExtendedClient } from '@core/domain/models/extended-client';
import { QueryResponse } from '@shared/abstractions/grid-response.dto';
import { GridCardsPaginator } from '@shared/abstractions/grid-cards/grid-cards-paginator';

@Component({
  selector: 'hta-client-managment',
  imports: [Button, Tag, Tooltip, SectionWrapper, Card, CardsGrid],
  templateUrl: './client-managment.html',
  styleUrl: './client-managment.css',
  providers: [
    ClientsService
  ]
})
export class ClientManagment implements OnInit {
  clients = signal<ExtendedClient[]>([]);
  paginator = signal<GridCardsPaginator | null>(null);

  #drawerManagerService = inject(DrawerManagerService);
  #clientsService = inject(ClientsService);

  ngOnInit(): void {
    this.#load();
  }

  newClient() {
    const drawerRef = this.#drawerManagerService.open<Client>({
      component: ClientForm,
      title: 'Nuevo Cliente',
    });

    drawerRef.confirmed().subscribe((client: Client) => {
      this.#clientsService.createClient({
        name: client.name,
        cuit: client.cuit,
        type: client.type,
      }).subscribe(() => {
        this.#load();
      });
    });
  }

  toggleStatus(client: ExtendedClient) {
    iif(
      () => client.isActive,
      this.#clientsService.inactivateClient(client.clientId),
      this.#clientsService.activateClient(client.clientId)
    ).subscribe(() => {
      this.#load();
    })

  }

  setOwner(client: ExtendedClient) {
    const drawerRef = this.#drawerManagerService.open<ExtendedClient>({
      component: InviteUserForm,
      title: 'Establecer usuario por defecto',
      inputs: {
        isDefaultUser: true,
      }
    });

    drawerRef.confirmed().subscribe((client) => {
      console.log(client);
    });
  }

  editClientHandler(client: ExtendedClient): void {
    const drawerRef = this.#drawerManagerService.open<ExtendedClient>({
      component: ClientForm,
      title: 'Editar Cliente',
      inputs: {
        client: client,
      }
    });

    drawerRef.confirmed().subscribe((client: ExtendedClient) => {
      this.#clientsService.updateClient(client.clientId, {
        name: client.name,
        cuit: client.cuit,
        type: client.type,
      }).subscribe(() => {
        this.#load();
      });
    });
  }

  #load(): void {
    this.#clientsService.getAllClients().subscribe(({ items, currentPage, rowsByPage, totalCount, totalPages }: QueryResponse<ExtendedClient>) => {
      this.clients.set(items);
      this.paginator.set({
        currentPage,
        rowsByPage,
        totalCount,
        totalPages
      })
    })
  }


}
