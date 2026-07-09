# Sistema de Becas ULEAM - Proyecto integrado Demo Day

Producto web para gestionar el flujo de becas estudiantiles de la ULEAM: el estudiante inicia sesión, verifica si cumple condiciones de elegibilidad, registra su postulación con documentos y consulta el seguimiento de su solicitud. El administrador puede entrar al módulo de seguimiento para revisar solicitudes y cambiar estados.

## Módulos integrados

- **Contenedora vanilla-ts**: login único, menú principal e integración por iframe.
- **Vue** (`/vue/`): verificador de elegibilidad.
- **React** (`/react/`): postulación y documentos.
- **Angular** (`/angular/`): seguimiento de solicitudes.

## Cómo ejecutar localmente

```bash
npm install
npm start
```

Durante desarrollo se levantan los módulos por separado:

- Portal: `http://localhost:3000`
- Vue: `http://localhost:5173`
- React: `http://localhost:5174`
- Angular: `http://localhost:4200`

## Cómo compilar para producción

```bash
npm run build
```

El resultado queda en una sola carpeta:

```txt
dist/
  index.html
  vue/
  react/
  angular/
```

Esta estructura cumple la integración solicitada para Demo Day: una URL pública, módulos en subcarpetas y navegación interna con hash routing.

## Supabase

Crear un proyecto Supabase único para todo el equipo y ejecutar el archivo:

```txt
supabase/schema.sql
```

Ese script crea las tablas mínimas y activa RLS para:

- `perfiles`
- `solicitudes_beca`
- `documentos_solicitud`

En Vercel configurar las variables de entorno:

```txt
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```

El login de la contenedora intenta autenticar contra Supabase Auth. Si las variables no existen, trabaja en modo demo para poder ensayar localmente.

## Deploy en Vercel

1. Subir el proyecto a GitHub.
2. Importar el repositorio en Vercel.
3. Configurar las variables de Supabase.
4. Verificar que Vercel use:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Abrir la URL pública y probar desde otro equipo o celular.

El archivo `vercel.json` ya incluye rewrites para `/vue/`, `/react/` y `/angular/`.

## Quién construyó qué módulo

Completar antes de entregar:

- Integrante 1: módulo Vue - verificador de elegibilidad.
- Integrante 2: módulo React - postulación y documentos.
- Integrante 3: módulo Angular - seguimiento de solicitudes.

## Decisiones y aprendizajes

Dividimos la solución en una contenedora vanilla-ts y tres módulos por framework para que cada integrante pueda defender su parte de forma independiente, pero dentro de un flujo común. La decisión técnica principal fue usar subcarpetas y hash routing, porque evita problemas de rutas profundas en producción y permite desplegar todo como una sola app estática. El login se dejó en la contenedora para mantener una sesión única compartida mediante `localStorage`, como pide el instructivo.

El reto más importante fue integrar aplicaciones hechas con frameworks distintos sin usar herramientas complejas como module federation. Para resolverlo, cada módulo queda compilado en su carpeta y se carga desde un iframe bajo el mismo dominio. Si volviéramos a hacerlo, integraríamos Supabase desde el inicio para no tener que adaptar después los datos que inicialmente estaban simulados en `localStorage`.

## Capturas y enlace de producción

Completar antes de entregar:

- URL pública: pendiente.
- Captura login: pendiente.
- Captura elegibilidad: pendiente.
- Captura postulación: pendiente.
- Captura seguimiento: pendiente.
