import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FloatLabelInput } from '@shared/components/float-label-input/float-label-input';
import { LoggedResponseDto } from '@core/domain/dtos/logged-user-response.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    RouterLink,
    MessageModule,
    FloatLabelModule,
    FloatLabelInput,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly #formBuilder = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  protected show2fa = false;
  protected tempToken = '';

  protected loginForm: FormGroup = this.#formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false]
  });

  protected twoFactorForm: FormGroup = this.#formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.#authService.login({ email, password }).subscribe({
        next: (res: LoggedResponseDto) => {
          if (res.requires2fa) {
            this.show2fa = true;
            this.tempToken = res.temp_token!;
          } else {
            this.#authService.setUser(res);
            // Cookie is set by browser
            this.#router.navigate(['/platform/dashboard']);
          }
        },
        error: (err) => {
          console.error('Login failed', err);
          // Ideally show a toast/message
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  protected onVerify2fa(): void {
    if (this.twoFactorForm.valid) {
      const code = this.twoFactorForm.value.code;
      this.#authService.verify2fa(this.tempToken, code).subscribe({
        next: (res) => {
          // Cookie is set by browser
          this.#router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('2FA failed', err);
        }
      });
    } else {
      this.twoFactorForm.markAllAsTouched();
    }
  }
}
