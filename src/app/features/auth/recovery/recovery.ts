import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-recovery',
  imports: [
    ButtonModule,
    InputTextModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MessageModule,
    FloatLabelModule
  ],
  templateUrl: './recovery.html',
  styleUrl: './recovery.css',
})
export class Recovery {

  recoveryForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
