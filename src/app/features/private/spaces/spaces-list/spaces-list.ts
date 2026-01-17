import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

// Imports de PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { Button } from "@shared/components/button/button";
import { catchError, of } from 'rxjs';
import { SpaceCard } from "../space-card/space-card";
import { ZoneService } from 'src/app/core/services/zone.service';
import { Zone } from "../../../../core";
import { Dialog as HtaDialog } from 'src/app/shared/components/dialog/dialog';
import { SpaceDetail } from "../space-detail/space-detail";

@Component({
  selector: 'hta-spaces-list',
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule,
    ButtonModule, ConfirmDialogModule, SelectModule, Button, SpaceCard, HtaDialog, SpaceDetail],
  templateUrl: './spaces-list.html',
  providers: [MessageService, ConfirmationService],
  styleUrl: './spaces-list.css',
})
export class SpacesList implements OnInit {
  #zoneService = inject(ZoneService);
  #messageService = inject(MessageService);

  spaces = signal<Zone[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedSpace = signal<Zone | null>(null);

  ngOnInit(): void {
    this.#zoneService.getAllZones()
      .pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de espacios.' });
          return of([]);
        })
      )
      .subscribe(zones => {
        this.spaces.set(zones);
      });
  }

  cancelHandler(): void {
    this.showDialog.set(false);
    this.isEditMode.set(false);
    this.selectedSpace.set(null);
  }

  confirmHandler(space: Zone): void {
    this.isEditMode.set(false);
    this.showDialog.set(true);
    this.saveSpace(space);
  }

  openNewSpaceDialog(): void {
    this.isEditMode.set(false);
    this.showDialog.set(true);
  }

  editHandler(zone: Zone): void {
    this.isEditMode.set(true);
    this.showDialog.set(true);
    this.selectedSpace.set(zone);
  }

  deleteHandler(space: Zone) {
    this.#zoneService.deleteZone(space.zoneId)
      .pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el espacio.' });
          return of(null);
        })
      )
      .subscribe(() => {
        this.#messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'El espacio ha sido removido' });
        this.ngOnInit();
      });
  }

  saveSpace(zone: Zone): void {
    if (this.isEditMode()) {
      this.#zoneService.updateZone(zone).pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el espacio.' });
          return of(null);
        })
      ).subscribe(() => {
        this.#messageService.add({ severity: 'info', summary: 'Actualizado', detail: 'El espacio ha sido actualizado' });
        this.showDialog.set(false);
        this.ngOnInit();
      });
    } else {
      this.#zoneService.createZone(zone).pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el espacio.' });
          return of(null);
        })
      ).subscribe(() => {
        this.#messageService.add({ severity: 'info', summary: 'Creado', detail: 'El espacio ha sido creado' });
        this.showDialog.set(false);
        this.ngOnInit();
      });
    }
  }

}
