# Fundación Deportiva Club V.R — Sitio Web

Sitio web de Fundación Deportiva Club V.R (Vite + React + React Router + Tailwind).

## Requisitos

- Node.js (recomendado 18+)
- npm

## Desarrollo

```bash
cd club-vr-futsal
npm install
npm run dev
```

## Build (producción)

```bash
cd club-vr-futsal
npm run build
npm run preview
```

El build queda en `club-vr-futsal/dist/`.

## Estructura rápida

- `club-vr-futsal/src/pages`: páginas (rutas)
- `club-vr-futsal/src/components`: componentes reutilizables
- `club-vr-futsal/src/App.jsx`: rutas con React Router

## Rutas principales

- `/` Inicio
- `/nosotros`
- `/aliados`
- `/galeria`
- `/horarios`
- `/resultados`
- `/contacto`

## Admin

- `/admin/login`
- `/admin/dashboard`

Nota: el panel actualmente guarda datos (patrocinadores/resultados) en `localStorage` del navegador. Para administración real multi-dispositivo se necesita backend.

## Deploy

Guía completa en `club-vr-futsal/DEPLOY.md`.
