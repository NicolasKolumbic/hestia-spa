import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SiteDropdown } from "@shared/bussiness/site-dropdown/site-dropdown";

@Component({
  selector: 'hta-header',
  imports: [AvatarModule, OverlayBadgeModule, SiteDropdown],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

}
