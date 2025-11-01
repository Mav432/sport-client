# Sport Center - E-commerce App

Aplicación de e-commerce para productos deportivos con sistema completo de autenticación y gestión de usuarios basado en roles (RBAC).

## 🚀 Características Principales

- ✅ **Sistema de Autenticación JWT**
- ✅ **Control de Acceso Basado en Roles** (Usuario, Empleado, Administrador)
- ✅ **Dashboards Personalizados** por rol
- ✅ **CRUD de Usuarios** (solo para administradores)
- ✅ **Gestión de Inventario** (para empleados)
- ✅ **Carrito de Compras** y sistema de pedidos
- ✅ **Design System SPURT** (Tailwind CSS + Material Icons)
- ✅ **Angular 18+** con arquitectura standalone

---

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 18.x

---

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd ecommerce-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
API_URL=https://back-sport.vercel.app
STORAGE_TOKEN_KEY=auth_token
STORAGE_USER_KEY=current_user
APP_NAME=Sport Center
APP_VERSION=1.0.0
NODE_ENV=development
```

---

## 🏃 Desarrollo

### Servidor de desarrollo
```bash
npm start
# o
ng serve
```

Abre tu navegador en `http://localhost:4200/`

### Compilación de desarrollo
```bash
ng build --configuration development
```

---

## 🚢 Despliegue a Producción

### 1. Build de producción
```bash
ng build --configuration production
```

Los archivos compilados estarán en `dist/ecommerce-app/browser/`

### 2. Desplegar en Vercel

#### Opción A: CLI de Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Opción B: GitHub Integration
1. Sube el código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno en Vercel:
   - `API_URL`
   - `NODE_ENV=production`
4. Deploy automático

### 3. Desplegar en Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist/ecommerce-app/browser
```

### 4. Desplegar en Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios y guards principales
│   │   ├── guards/             # Auth y Role guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # Interfaces y tipos
│   │   └── services/           # AuthService, etc.
│   │
│   ├── features/               # Módulos de funcionalidades
│   │   ├── auth/              # Login y Register
│   │   ├── dashboard/         # Dashboards por rol
│   │   │   ├── usuario/
│   │   │   ├── empleado/
│   │   │   └── admin/
│   │   ├── products/          # Catálogo de productos
│   │   └── offers/            # Ofertas especiales
│   │
│   └── shared/                # Componentes compartidos
│       └── components/
│           ├── navbar/
│           ├── footer/
│           └── home/
│
└── environments/              # Variables de entorno
    ├── environment.ts
    └── environment.prod.ts
```

---

## 🔐 Roles y Permisos

### Usuario (Rol 1)
- Ver catálogo de productos
- Realizar compras
- Ver historial de pedidos
- Gestionar favoritos

### Empleado (Rol 2)
- Todo lo de Usuario +
- Gestionar inventario
- Procesar pedidos
- Ver reportes de ventas

### Administrador (Rol 3)
- Todo lo anterior +
- **CRUD completo de usuarios**
- Crear usuarios con cualquier rol
- Activar/desactivar cuentas
- Ver estadísticas del sistema

---

## 🎨 Design System

- **Colores**: 
  - Primary: `#0367A6`
  - Accent: `#FF7A00`
  - Text: `#202020`
- **Tipografía**: Inter (Google Fonts)
- **Iconos**: Material Symbols Outlined
- **Framework CSS**: Tailwind CSS

---

## 🔧 Configuración de Backend

El backend debe responder con las siguientes estructuras:

### Login: POST `/users/login-user`
**Request:**
```json
{
  "email": "usuario@email.com",
  "passw": "contraseña"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Register: POST `/users/create-user`
**Request:**
```json
{
  "nombre": "Juan",
  "aPaterno": "Pérez",
  "aMaterno": "García",
  "email": "juan@email.com",
  "telefono": "5551234567",
  "passw": "password123",
  "rol": 1,
  "activo": 1
}
```

**Response:**
```json
{
  "id_usuario": 16,
  "nombre": "Juan",
  "email": "juan@email.com",
  ...
}
```

---

## 📊 Scripts Disponibles

```bash
npm start              # Servidor de desarrollo
npm run build          # Build de producción
npm run watch          # Build en modo watch
npm test               # Ejecutar tests
npm run lint           # Linter
```

---

## 🔒 Seguridad

- ✅ JWT Tokens en localStorage
- ✅ HTTP Interceptor para auto-autenticación
- ✅ Guards en todas las rutas sensibles
- ✅ Role-based Access Control (RBAC)
- ✅ Validación de estado activo del usuario
- ✅ Logout automático en sesión expirada

---

## 📝 Variables de Entorno en Producción

Al desplegar, configura estas variables en tu plataforma:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_URL` | URL del backend | `https://back-sport.vercel.app` |
| `NODE_ENV` | Entorno | `production` |

---

## 🐛 Troubleshooting

### Error de CORS
Si ves errores de CORS, asegúrate de que el backend tenga configurado:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Token inválido
Si el login falla, verifica que el JWT contenga:
```json
{
  "id": 1,
  "email": "usuario@email.com",
  "rol": 1
}
```

---

## 👥 Autores

- **Equipo Sport Center**

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 🆘 Soporte

Para soporte técnico, contacta a: soporte@sportcenter.com
