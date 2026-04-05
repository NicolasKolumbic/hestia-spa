import { Component, input, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';


@Component({
  selector: 'hta-search-field',
  imports: [InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './search-field.html',
  styleUrl: './search-field.css',
})
export class SearchField {
  placeholder = input<string>()
  search = output<string>()

  onSearch(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.search.emit(text);
  }
}
