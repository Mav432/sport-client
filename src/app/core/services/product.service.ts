import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, map, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Category, ProductFilters, ProductSearchResult } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Estado reactivo para productos
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  
  // Signals para estado de UI
  public isLoading = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public activeFilters = signal<ProductFilters>({});

  // Datos mock para desarrollo - REEMPLAZAR con API real
  private mockProducts: Product[] = [
    {
      id: 1,
      nombre: 'Balón Nike Pro',
      descripcion: 'Balón profesional de fútbol Nike Pro con tecnología de última generación.',
      precio: 450.00,
      imagen: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop',
      imagenes: [
        'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop&blur=2',
        'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop&sat=-50',
        'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=400&fit=crop&hue=20'
      ],
      categoria: 'futbol',
      stock: 15,
      disponible: true,
      marca: 'Nike',
      color: ['Blanco', 'Negro'],
      descuento: 0
    },
    {
      id: 2,
      nombre: 'Tenis Adidas Running',
      descripcion: 'Tenis para correr con tecnología Boost de Adidas. Máximo confort.',
      precio: 1200.00,
      imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      imagenes: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&blur=2',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&sat=-100',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&hue=30'
      ],
      categoria: 'running',
      stock: 8,
      disponible: true,
      marca: 'Adidas',
      talla: ['26', '27', '28', '29'],
      color: ['Negro', 'Azul', 'Gris'],
      descuento: 15
    },
    {
      id: 3,
      nombre: 'Tenis New Balance',
      descripcion: 'Tenis para correr con tecnología Boost de Adidas. Máximo confort.',
      precio: 1200.00,
      imagen: '/assets/images/products/tenis_3d.webp',
      imagenes: [
        '/assets/images/products/tenis_3d-1.webp',
        '/assets/images/products/tenis_3d-2.webp',
        '/assets/images/products/tenis_3d-3.webp',
        '/assets/images/products/QR_tennis-3d.jpeg'
      ],
      categoria: 'Lifestyle',
      stock: 8,
      disponible: true,
      marca: 'NB',
      talla: ['26', '27', '28', '29'],
      color: ['Blanco', 'Azul', 'Gris'],
      descuento: 10
    },
    {
      id: 4,
      nombre: 'Guantes de Portero Puma',
      descripcion: 'Guantes profesionales para portero con grip superior.',
      precio: 890.00,
      imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      imagenes: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&blur=2',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&sat=-50',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&hue=90'
      ],
      categoria: 'futbol',
      stock: 12,
      disponible: true,
      marca: 'Puma',
      talla: ['8', '9', '10'],
      color: ['Verde', 'Naranja'],
      descuento: 20
    },
    {
      id: 5,
      nombre: 'Pelota de Basketball Wilson',
      descripcion: 'Pelota oficial de basketball Wilson para competencias.',
      precio: 650.00,
      imagen: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
      imagenes: [
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&blur=2',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&sat=-50',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&hue=10'
      ],
      categoria: 'basketball',
      stock: 20,
      disponible: true,
      marca: 'Wilson',
      color: ['Naranja'],
      descuento: 0
    },
    {
      id: 6,
      nombre: 'Raqueta de Tenis Head',
      descripcion: 'Raqueta profesional Head con tecnología Graphene 360+.',
      precio: 2500.00,
      imagen: 'https://images.unsplash.com/photo-1530915365347-e35b7267196f?w=400&h=400&fit=crop',
      imagenes: [
        'https://images.unsplash.com/photo-1530915365347-e35b7267196f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1530915365347-e35b7267196f?w=400&h=400&fit=crop&blur=2',
        'https://images.unsplash.com/photo-1530915365347-e35b7267196f?w=400&h=400&fit=crop&sat=-50',
        'https://images.unsplash.com/photo-1530915365347-e35b7267196f?w=400&h=400&fit=crop&hue=180'
      ],
      categoria: 'tenis',
      stock: 0,
      disponible: false,
      marca: 'Head',
      descuento: 0
    }
  ];

  // Agregar más productos para dar mayor extensión al catálogo
  // (IDs continuan desde 7 en adelante)
  private extendMockProducts() {
    const more: Product[] = [
      {
        id: 7,
        nombre: 'Camiseta Entrenamiento Pro',
        descripcion: 'Camiseta transpirable para entrenamiento de alto rendimiento.',
        precio: 299.99,
        imagen: 'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop&hue=200'
        ],
        categoria: 'fitness',
        stock: 40,
        disponible: true,
        marca: 'Revo',
        color: ['Negro', 'Gris'],
        descuento: 10
      },
      {
        id: 8,
        nombre: 'Mancuernas Hex 10kg',
        descripcion: 'Par de mancuernas hexagonales recubiertas en goma.',
        precio: 950.00,
        imagen: 'https://images.unsplash.com/photo-1599058917217-6d0d3d3d0f7b?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1599058917217-6d0d3d3d0f7b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1599058917217-6d0d3d3d0f7b?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1599058917217-6d0d3d3d0f7b?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1599058917217-6d0d3d3d0f7b?w=400&h=400&fit=crop&hue=30'
        ],
        categoria: 'fitness',
        stock: 25,
        disponible: true,
        marca: 'ProFit',
        descuento: 5
      },
      {
        id: 9,
        nombre: 'Cinta para Correr Foldable',
        descripcion: 'Cinta plegable con monitor y varios niveles de resistencia.',
        precio: 7800.00,
        imagen: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop&hue=120'
        ],
        categoria: 'running',
        stock: 4,
        disponible: true,
        marca: 'RunMax',
        descuento: 12
      },
      {
        id: 10,
        nombre: 'Balón Futsal Elite',
        descripcion: 'Balón de futsal con excelente control y durabilidad.',
        precio: 220.00,
        imagen: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop&hue=270'
        ],
        categoria: 'futbol',
        stock: 50,
        disponible: true,
        marca: 'Select',
        descuento: 0
      },
      {
        id: 11,
        nombre: 'Gorra Running UV',
        descripcion: 'Gorra ligera con protección UV y ajuste trasero.',
        precio: 149.99,
        imagen: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400&h=400&fit=crop&hue=60'
        ],
        categoria: 'running',
        stock: 120,
        disponible: true,
        marca: 'TrailGear',
        descuento: 0
      },
      {
        id: 12,
        nombre: 'Shorts Baloncesto Pro',
        descripcion: 'Shorts transpirables y amplios para máxima movilidad.',
        precio: 199.99,
        imagen: 'https://images.unsplash.com/photo-1552345386-cae9b8c1b3b1?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1552345386-cae9b8c1b3b1?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1552345386-cae9b8c1b3b1?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1552345386-cae9b8c1b3b1?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1552345386-cae9b8c1b3b1?w=400&h=400&fit=crop&hue=150'
        ],
        categoria: 'basketball',
        stock: 33,
        disponible: true,
        marca: 'CourtWear',
        descuento: 8
      },
      {
        id: 13,
        nombre: 'Chamarra Térmica',
        descripcion: 'Chamarra térmica con aislamiento para entrenamiento en clima frío.',
        precio: 699.50,
        imagen: 'https://images.unsplash.com/photo-1541534401786-0d9bbf0a1f80?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1541534401786-0d9bbf0a1f80?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1541534401786-0d9bbf0a1f80?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1541534401786-0d9bbf0a1f80?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1541534401786-0d9bbf0a1f80?w=400&h=400&fit=crop&hue=240'
        ],
        categoria: 'fitness',
        stock: 18,
        disponible: true,
        marca: 'NorthFit',
        descuento: 15
      },
      {
        id: 14,
        nombre: 'Zapato Fútbol Sala',
        descripcion: 'Calzado de fútbol sala con suela optimizada para indoor.',
        precio: 549.00,
        imagen: 'https://images.unsplash.com/photo-1520975698510-8280f60a12d5?w=400&h=400&fit=crop',
        imagenes: [
          'https://images.unsplash.com/photo-1520975698510-8280f60a12d5?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1520975698510-8280f60a12d5?w=400&h=400&fit=crop&blur=2',
          'https://images.unsplash.com/photo-1520975698510-8280f60a12d5?w=400&h=400&fit=crop&sat=-50',
          'https://images.unsplash.com/photo-1520975698510-8280f60a12d5?w=400&h=400&fit=crop&hue=300'
        ],
        categoria: 'futbol',
        stock: 9,
        disponible: true,
        marca: 'SalaPro',
        descuento: 0
      }
    ];

    // Añadir solo si no existen (evita duplicados en reinicios)
    for (const p of more) {
      if (!this.mockProducts.find(mp => mp.id === p.id)) {
        this.mockProducts.push(p);
      }
    }
  }


  private mockCategories: Category[] = [
    { id: 'todos', nombre: 'Todos', icono: 'sports' },
    { id: 'futbol', nombre: 'Fútbol', icono: 'sports_soccer' },
    { id: 'running', nombre: 'Running', icono: 'directions_run' },
    { id: 'basketball', nombre: 'Basketball', icono: 'sports_basketball' },
    { id: 'tenis', nombre: 'Tenis', icono: 'sports_tennis' },
    { id: 'natacion', nombre: 'Natación', icono: 'pool' }
  ];

  constructor() {
    // Cargar productos iniciales
    // Extender mock con más productos para demo
    this.extendMockProducts();
    this.loadProducts();
  }

  /**
   * Método de conveniencia para obtener productos (compatible con llamadas existentes)
   */
  getProducts(): Observable<Product[]> {
    return this.loadProducts();
  }

  /**
   * Añadir un nuevo producto (mock) — en producción esto sería una llamada POST
   */
  addProduct(product: Partial<Product>): Observable<Product> {
    const nextId = Math.max(...this.mockProducts.map(p => p.id), 0) + 1;
    const newProduct: Product = {
      id: nextId,
      nombre: product.nombre || 'Producto',
      descripcion: product.descripcion || '',
      precio: product.precio ?? 0,
      imagen: product.imagen || 'https://images.unsplash.com/photo-1520975913541-6d1f0d1f1a6b?w=400&h=400&fit=crop',
      categoria: product.categoria || 'otros',
      stock: product.stock ?? 0,
      disponible: product.disponible ?? true,
      marca: product.marca || 'Sin Marca',
      color: product.color || [],
      descuento: product.descuento ?? 0
    };

    this.mockProducts.push(newProduct);
    // Actualizar subject
    this.productsSubject.next(this.mockProducts);

    return of(newProduct).pipe(delay(200));
  }

  /**
   * Eliminar producto por ID (mock)
   */
  deleteProduct(id: number): Observable<void> {
    const idx = this.mockProducts.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.mockProducts.splice(idx, 1);
      this.productsSubject.next(this.mockProducts);
    }
    return of(void 0).pipe(delay(150));
  }

  /**
   * Cargar todos los productos
   */
  loadProducts(): Observable<Product[]> {
    this.isLoading.set(true);
    
    // Simular llamada a API con delay
    return of(this.mockProducts).pipe(
      delay(500), // Simular latencia de red
      map(products => {
        this.productsSubject.next(products);
        this.isLoading.set(false);
        return products;
      })
    );
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: number): Observable<Product | null> {
    return of(this.mockProducts.find(p => p.id === id) || null).pipe(
      delay(300)
    );
  }

  /**
   * Buscar productos con filtros
   */
  searchProducts(searchTerm: string, filters: ProductFilters = {}): Observable<ProductSearchResult> {
    this.isLoading.set(true);
    this.searchTerm.set(searchTerm);
    this.activeFilters.set(filters);

    return of(this.mockProducts).pipe(
      delay(300),
      map(products => {
        let filteredProducts = [...products];

        // Filtro por término de búsqueda
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.nombre.toLowerCase().includes(term) ||
            product.descripcion.toLowerCase().includes(term) ||
            product.marca?.toLowerCase().includes(term) ||
            product.categoria.toLowerCase().includes(term)
          );
        }

        // Filtro por categoría
        if (filters.categoria && filters.categoria !== 'todos') {
          filteredProducts = filteredProducts.filter(product =>
            product.categoria === filters.categoria
          );
        }

        // Filtro por marca
        if (filters.marca) {
          filteredProducts = filteredProducts.filter(product =>
            product.marca?.toLowerCase() === filters.marca?.toLowerCase()
          );
        }

        // Filtro por rango de precio
        if (filters.precioMin !== undefined) {
          filteredProducts = filteredProducts.filter(product =>
            product.precio >= filters.precioMin!
          );
        }

        if (filters.precioMax !== undefined) {
          filteredProducts = filteredProducts.filter(product =>
            product.precio <= filters.precioMax!
          );
        }

        // Filtro por disponibilidad
        if (filters.disponible !== undefined) {
          filteredProducts = filteredProducts.filter(product =>
            product.disponible === filters.disponible
          );
        }

        // Ordenamiento
        if (filters.ordenarPor) {
          switch (filters.ordenarPor) {
            case 'precio-asc':
              filteredProducts.sort((a, b) => a.precio - b.precio);
              break;
            case 'precio-desc':
              filteredProducts.sort((a, b) => b.precio - a.precio);
              break;
            case 'nombre':
              filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
              break;
          }
        }

        const result: ProductSearchResult = {
          products: filteredProducts,
          total: filteredProducts.length,
          hasResults: filteredProducts.length > 0
        };

        this.productsSubject.next(filteredProducts);
        this.isLoading.set(false);
        
        return result;
      })
    );
  }

  /**
   * Obtener categorías disponibles
   */
  getCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  /**
   * Obtener marcas disponibles
   */
  getBrands(): Observable<string[]> {
    const brands = [...new Set(this.mockProducts.map(p => p.marca).filter(Boolean))];
    return of(brands as string[]);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm.set('');
    this.activeFilters.set({});
    this.loadProducts().subscribe();
  }

  /**
   * Obtener precio con descuento
   */
  getPriceWithDiscount(product: Product): number {
    if (product.descuento && product.descuento > 0) {
      return product.precio * (1 - product.descuento / 100);
    }
    return product.precio;
  }
}