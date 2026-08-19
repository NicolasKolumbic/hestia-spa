import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef, contentChild } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Divider } from "primeng/divider";
import { GridCardsPaginator } from '@shared/abstractions/grid-cards/grid-cards-paginator';

@Component({
  selector: 'hta-cards-grid',
  imports: [NgTemplateOutlet, PaginatorModule, Divider],
  templateUrl: './cards-grid.html',
  styleUrl: './cards-grid.css',
})
export class CardsGrid<T> {
  items = input.required<T[]>();
  emptyMessage = input<string>('');
  paginator = input<GridCardsPaginator>();

  contentTemplate = contentChild.required<TemplateRef<any>>('content');
  emptyTemplate = contentChild<TemplateRef<any>>('emptyContent');

  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.rows = event.rows ?? 10;
  }
}
