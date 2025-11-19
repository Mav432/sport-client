import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex mb-6" aria-label="Breadcrumb" *ngIf="items().length > 0">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a routerLink="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-spurt-primary transition-colors">
            <span class="material-symbols-outlined text-sm mr-2">home</span>
            Inicio
          </a>
        </li>
        <li *ngFor="let item of items(); let isLast = last" [attr.aria-current]="isLast ? 'page' : null">
          <div class="flex items-center">
            <span class="material-symbols-outlined text-gray-400 mx-2">chevron_right</span>
            <a *ngIf="item.url && !isLast; else staticItem" 
               [routerLink]="item.url" 
               class="ml-1 text-sm font-medium text-gray-700 hover:text-spurt-primary transition-colors">
              <span *ngIf="item.icon" class="material-symbols-outlined text-sm mr-2">{{ item.icon }}</span>
              {{ item.label }}
            </a>
            <ng-template #staticItem>
              <span class="ml-1 text-sm font-medium" 
                    [ngClass]="isLast ? 'text-gray-500' : 'text-gray-700'">
                <span *ngIf="item.icon" class="material-symbols-outlined text-sm mr-2">{{ item.icon }}</span>
                {{ item.label }}
              </span>
            </ng-template>
          </div>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-separator {
      transition: color 0.2s ease-in-out;
    }
    
    a:hover + .breadcrumb-separator {
      color: #0367A6;
    }
  `]
})
export class Breadcrumbs {
  items = input.required<BreadcrumbItem[]>();
  
  // Computed property para mostrar solo si hay items
  hasItems = computed(() => this.items().length > 0);
}