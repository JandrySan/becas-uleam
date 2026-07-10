import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs';

import { dirname, resolve } from 'node:path';

const root = process.cwd();
const archivoEnv = resolve(root, '.env');

function cargarEnvLocal() {
  if (!existsSync(archivoEnv)) return;

  const contenido = readFileSync(archivoEnv, 'utf8');

  for (const lineaOriginal of contenido.split(/\r?\n/)) {
    const linea = lineaOriginal.trim();

    if (!linea || linea.startsWith('#')) continue;

    const posicionIgual = linea.indexOf('=');

    if (posicionIgual === -1) continue;

    const clave = linea.slice(0, posicionIgual).trim();

    let valor = linea
      .slice(posicionIgual + 1)
      .trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (!process.env[clave]) {
      process.env[clave] = valor;
    }
  }
}

cargarEnvLocal();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Falta la variable VITE_SUPABASE_URL para compilar Angular.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Falta la variable VITE_SUPABASE_ANON_KEY para compilar Angular.'
  );
}

const destino = resolve(
  root,
  '3seguimiento-angular',
  'src',
  'environments',
  'environment.generated.ts'
);

mkdirSync(dirname(destino), {
  recursive: true
});

const contenido = `
// Este archivo es generado automáticamente durante el build.
// No editar manualmente ni subir al repositorio.

export const environment = {
  production: true,
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)}
} as const;
`.trimStart();

writeFileSync(destino, contenido, 'utf8');

console.log(
  'Configuración de Supabase generada para el módulo Angular.'
);