# La Masia Pizzería

Landing Page premium para **La Masia Pizzería** — pizzería artesanal en Puente Alto, Chile.

## Stack

- React 19 + Vite
- React Router DOM
- React Bootstrap / Bootstrap 5
- Framer Motion
- React Icons
- SweetAlert2
- React Hook Form
- Context API + LocalStorage

## Instalación

```bash
npm install
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

## Estructura

```
src/
├── assets/          # Logo, imágenes
├── components/
│   ├── layout/      # Navbar, Footer, Cart, WhatsApp
│   ├── sections/    # Secciones de la landing
│   └── ui/          # Componentes reutilizables
├── context/         # CartContext, AdminContext
├── data/            # Datos iniciales y constantes
├── hooks/           # Custom hooks
├── pages/           # HomePage, Admin
├── services/        # WhatsApp, Email, Storage
├── styles/          # CSS global
└── utils/           # Utilidades
```

## Panel Administrador

Ruta oculta: `/masia-admin-2026`

- Usuario: `admin`
- Contraseña: `masia2026`

## WhatsApp

Pedidos redirigen a: **+56 9 9076 2511**

## Cupones de prueba

- `MASIA10` — 10% de descuento
- `PIZZA2000` — $2.000 de descuento

## Logo

Reemplaza `src/assets/logo.svg` con el logo oficial del cliente.

## Backend futuro

El servicio `EmailService` genera payloads listos para integración con Spring Boot en `/api/orders/email`.
