import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule,
    InputTextModule, TextareaModule, Dropdown, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm: FormGroup;
  loading = false;

  // Opciones de "Intención"
  subjects: DropdownOption[] = [
    { label: 'Quiero domotizar mi casa', value: 'sales_b2c' },
    { label: 'Soy desarrollador/constructor (B2B)', value: 'sales_b2b' },
    { label: 'Soporte Técnico', value: 'support' },
    { label: 'Prensa o Alianzas', value: 'pr' }
  ];

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: [null, Validators.required], // Dropdown
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.loading = true;

      // Simulación de envío API
      setTimeout(() => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Mensaje Enviado', detail: 'Un especialista de Hestia te contactará pronto.' });
        this.contactForm.reset();
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor completa los campos requeridos.' });
    }
  }
}

