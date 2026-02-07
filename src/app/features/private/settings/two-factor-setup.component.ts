import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
    selector: 'app-two-factor-setup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        MessageModule,
        FloatLabelModule
    ],
    template: `
    <div class="flex flex-col items-center justify-center p-6 gap-6">
      <h2 class="text-2xl font-bold">Configurar Autenticación de Doble Factor (2FA)</h2>
      
      @if (!qrCodeUrl) {
        <p>Cargando código QR...</p>
      } @else {
        <div class="flex flex-col items-center gap-4">
          <p class="text-gray-600 text-center">
            Escanea el siguiente código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.):
          </p>
          <img [src]="qrCodeUrl" alt="QR Code 2FA" class="border rounded-md shadow-sm p-2 bg-white" />
        </div>

        <form [formGroup]="setupForm" (ngSubmit)="onSetup()" class="w-full max-w-sm flex flex-col gap-4 mt-4">
            <div class="flex flex-col gap-2">
                <label for="code" class="block text-sm font-medium text-gray-700">Código de Verificación</label>
                <input 
                    pInputText 
                    id="code" 
                    formControlName="code" 
                    placeholder="123456" 
                    class="w-full"
                    [class.ng-invalid]="setupForm.get('code')?.invalid && setupForm.get('code')?.touched"
                />
                <small *ngIf="setupForm.get('code')?.invalid && setupForm.get('code')?.touched" class="text-red-500 block">
                    El código debe ser de 6 dígitos.
                </small>
            </div>

            <p-button 
                label="Activar 2FA" 
                type="submit" 
                [loading]="loading" 
                [disabled]="setupForm.invalid" 
                styleClass="w-full"
            ></p-button>
        </form>
      }

      @if (successMessage) {
        <p-message severity="success" [text]="successMessage" styleClass="w-full"></p-message>
      }
      @if (errorMessage) {
        <p-message severity="error" [text]="errorMessage" styleClass="w-full"></p-message>
      }
    </div>
  `,
    styles: []
})
export class TwoFactorSetupComponent implements OnInit {
    private _fb = inject(FormBuilder);
    private _authService = inject(AuthService);

    qrCodeUrl: string | null = null;
    loading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    setupForm: FormGroup = this._fb.group({
        code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    ngOnInit(): void {
        this.loadQrCode();
    }

    loadQrCode() {
        this._authService.generate2faSecret().subscribe({
            next: (res: { qrCode: string }) => {
                this.qrCodeUrl = res.qrCode;
            },
            error: (err: any) => {
                this.errorMessage = 'Error generando el código QR.';
                console.error(err);
            }
        });
    }

    onSetup() {
        if (this.setupForm.valid) {
            this.loading = true;
            this.errorMessage = null;
            this.successMessage = null;

            const code = this.setupForm.value.code;
            this._authService.turnOn2fa(code).subscribe({
                next: () => {
                    this.loading = false;
                    this.successMessage = '¡2FA activado correctamente!';
                    this.qrCodeUrl = null; // Hide QR on success? Or keep it? keeping it logic simple.
                },
                error: (err: any) => {
                    this.loading = false;
                    this.errorMessage = 'Código inválido o error al activar.';
                    console.error(err);
                }
            });
        }
    }
}
