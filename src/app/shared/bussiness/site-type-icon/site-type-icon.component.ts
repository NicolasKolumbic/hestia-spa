import { Component, computed, input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
    selector: 'hta-site-type-icon',
    styles: [`
        :host {
            display: inline-block;
        }
    `],
    template: `
    <span [style.font-size]="size()+'px'" [ngClass]="'icon-'+icon()"></span>
    `,
    imports: [NgClass]

})
export class SiteTypeIconComponent {
    siteType = input.required<string>();
    size = input<number>(16);

    icon = computed<string>(() => {
        switch (this.siteType()) {
            case 'RESIDENTIAL':
                return 'site-residential';
            case 'COMMERCIAL':
                return 'site-store';
            case 'INDUSTRIAL':
                return 'site-industrial';
            case 'INSTITUTIONAL':
                return 'site-institucional-alternative';
            case 'RURAL':
                return 'site-rural';
            case 'OFFICE':
                return 'work';
            default:
                return 'site-other';
        }
    });
}

