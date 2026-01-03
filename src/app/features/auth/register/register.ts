import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    CheckboxModule,
    RouterLink,
    MessageModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  protected registerForm: FormGroup = this._formBuilder.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit(): void {
    if (this.registerForm.valid) {
      this._authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Redirect to login or auto-login
          this._router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Registration failed', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
