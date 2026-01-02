import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HestiaBrand } from '@shared/components/hestia-brand/hestia-brand';

@Component({
  selector: 'hta-auth-base',
  imports: [RouterOutlet, HestiaBrand],
  templateUrl: './auth-base.html',
  styleUrl: './auth-base.css',
})
export class AuthBase {

}
