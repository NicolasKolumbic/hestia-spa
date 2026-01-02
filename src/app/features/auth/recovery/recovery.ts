import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recovery',
  imports: [
    ButtonModule,
    InputTextModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './recovery.html',
  styleUrl: './recovery.css',
})
export class Recovery {

}
