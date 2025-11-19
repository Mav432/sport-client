import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, ProductFilters } from '../../../core/models/product.model';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Breadcrumbs],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  // Estado de la búsqueda
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortBy = signal<string>('');
  showOnlyAvailable = signal<boolean>(false);

  // Datos reactivos
  searchResults = signal<{products: Product[], total: number, hasResults: boolean}>({
    products: [], 
    total: 0, 
    hasResults: false
  });
  categories = signal<Category[]>([]);
  brands = signal<string[]>([]);
  isLoading = computed(() => this.productService.isLoading());
  
  // Estado de la UI
  showFilters = signal<boolean>(false);
  noResults = computed(() => !this.searchResults().hasResults && !this.isLoading());

  // Breadcrumbs para el catálogo
  breadcrumbs = computed((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Productos', icon: 'storefront' }
    ];

    // Agregar término de búsqueda si existe
    if (this.searchTerm()) {
      items.push({ label: `Búsqueda: "${this.searchTerm()}"` });
    }

    // Agregar categoría si está seleccionada
    if (this.selectedCategory()) {
      const category = this.categories().find(c => c.id === this.selectedCategory());
      if (category) {
        items.push({ label: category.nombre });
      }
    }

    return items;
  });

  ngOnInit() {
    // Suscribirse a cambios en los query parameters
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      this.loadInitialData();
    });
  }

  private loadInitialData() {
    // Cargar categorías
    this.productService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });

    // Cargar marcas
    this.productService.getBrands().subscribe(brands => {
      this.brands.set(brands);
    });

    // Realizar búsqueda inicial
    this.onSearch();
  }

  onSearch() {
    const filters: ProductFilters = {
      categoria: this.selectedCategory() || undefined,
      marca: this.selectedBrand() || undefined,
      precioMin: this.minPrice() || undefined,
      precioMax: this.maxPrice() || undefined,
      disponible: this.showOnlyAvailable() ? true : undefined,
      ordenarPor: this.sortBy() as any
    };

    this.productService.searchProducts(this.searchTerm(), filters).subscribe(result => {
      this.searchResults.set(result);
    });
  }

  onCategoryChange() {
    this.onSearch();
  }

  onBrandChange() {
    this.onSearch();
  }

  onPriceChange() {
    this.onSearch();
  }



  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortBy.set('');
    this.showOnlyAvailable.set(false);
    this.onSearch();
  }

  toggleFilters() {
    this.showFilters.set(!this.showFilters());
  }

  getPriceWithDiscount(product: Product): number {
    return this.productService.getPriceWithDiscount(product);
  }

  hasDiscount(product: Product): boolean {
    return product.descuento ? product.descuento > 0 : false;
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  }

  getStockText(product: Product): string {
    if (!product.disponible || product.stock === 0) return 'Agotado';
    if (product.stock <= 5) return `Solo ${product.stock} disponibles`;
    return 'Disponible';
  }
}
