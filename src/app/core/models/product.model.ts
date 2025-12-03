// Modelo de Producto
export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  imagenes?: string[]; // Array de 1 principal + 3 extras (máximo 4)
  categoria: string;
  stock: number;
  disponible: boolean;
  marca?: string;
  talla?: string[];
  color?: string[];
  descuento?: number;
  fechaCreacion?: string;
}

// Categorías disponibles
export interface Category {
  id: string;
  nombre: string;
  icono: string;
}

// Filtros de búsqueda
export interface ProductFilters {
  categoria?: string;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  ordenarPor?: 'precio-asc' | 'precio-desc' | 'nombre' | 'fecha';
}

// Respuesta de búsqueda
export interface ProductSearchResult {
  products: Product[];
  total: number;
  hasResults: boolean;
}