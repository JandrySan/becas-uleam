export type EstadoSolicitud = 'Recibida' | 'En revisión' | 'Aprobada' | 'Rechazada' | 'Corrección requerida';

export interface Estudiante {
  id: number;
  cedula: string;
  nombre: string;
  carrera: string;
  semestre: number;
  promedio: number;
  correo?: string;
  telefono?: string;
  ingreso?: number;
  cargaFamiliar?: number;
  quintil?: number;
  padreNombre?: string;
  madreNombre?: string;
  hermanos?: number;
  vivienda?: string;
}

export interface Beca {
  id: number;
  nombre: string;
  tipo: 'Académica' | 'Socioeconómica' | 'Deportiva';
  monto: number;
  requisitos: string[];
}

export interface SolicitudBeca {
  id: number;
  codigo: string;
  estudiante: Estudiante;
  beca: Beca;
  estado: EstadoSolicitud;
  fechaPostulacion: string;
  fechaUltimaRevision: string;
  observaciones: string;
  documentosPendientes: string[];
  notificaciones: string[];
}
