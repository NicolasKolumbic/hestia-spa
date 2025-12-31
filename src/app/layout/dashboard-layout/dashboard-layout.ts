import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hta-dashboard-layout',
  imports: [Navbar, RouterOutlet, AvatarModule, OverlayBadgeModule, CommonModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {

}
