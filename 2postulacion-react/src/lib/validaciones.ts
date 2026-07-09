import limitesData from '../data/limites-documentos.json';

export interface LimitesDocumento {
  cedula: string;
  record: string;
  planilla: string;
}

const limitesDocumento: LimitesDocumento = limitesData;

export function parsearBytesLimite(limit: string): number {
  const match = limit.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*mb$/);
  if (!match) {
    return 2 * 1024 * 1024;
  }
  return Math.round(parseFloat(match[1]) * 1024 * 1024);
}

export function validarNombre(value: string): string {
  if (!value) {
    return 'Nombre es obligatorio.';
  }
  if (value.length < 3) {
    return 'El nombre debe tener al menos 3 caracteres.';
  }
  return '';
}

export function validarEmail(value: string): string {
  if (!value) {
    return 'Correo es obligatorio.';
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return 'Ingrese un correo con formato válido.';
  }
  return '';
}

export function validarArchivoPdf(
  file: File | undefined,
  key: keyof LimitesDocumento,
  yaCargado: boolean,
): string {
  const limitLabel = limitesDocumento[key];
  const limitBytes = parsearBytesLimite(limitLabel);

  if (!file) {
    return yaCargado ? '' : 'Este archivo es obligatorio.';
  }

  if (file.size > limitBytes) {
    return `El archivo no puede exceder ${limitLabel}.`;
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Solo se permiten archivos PDF.';
  }

  return '';
}
