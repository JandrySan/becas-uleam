# Módulo 3 — Seguimiento de Solicitud de Beca ULEAM, Angular

Prototipo navegable con datos simulados en memoria. No usa base de datos.

## Ejecutar

```bash
npm install
npm start
```

Rutas principales:

- `/seguimiento`: listado de solicitudes, filtro por texto y filtro por estado.
- `/seguimiento/:id`: detalle dinámico de una solicitud.

## Qué demostrar en la rúbrica

1. Componentes y parámetros: `SolicitudCardComponent` recibe `@Input() solicitud` y emite `@Output() verDetalle`.
2. Lógica de plantillas: `@for` para listas y `@if` para mostrar pendientes/notificaciones.
3. Binding de formularios: filtros con `ngModel` conectados a signals.
4. Estado local y derivado: `busqueda`, `filtroEstado`, `solicitudesFiltradas` y `totalPendientes`.
5. Estado global: `SeguimientoStoreService` con `signal` y `computed`, compartido por navbar, listado y detalle.
6. Navegabilidad: navbar con `routerLink`, rutas en `main.ts` y navegación por código con `router.navigate`.
7. Ruta dinámica: `/seguimiento/:id` lee el parámetro con `ActivatedRoute`.
