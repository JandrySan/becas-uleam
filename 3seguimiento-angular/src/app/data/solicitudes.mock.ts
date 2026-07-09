import { SolicitudBeca } from '../models/beca.model';

export const SOLICITUDES_MOCK: SolicitudBeca[] = [
  {
    id: 1,
    codigo: 'ULEAM-BECA-2026-001',
    estudiante: { id: 1, cedula: '1312345678', nombre: 'María Zambrano', carrera: 'Software', semestre: 4, promedio: 9.1 },
    beca: { id: 1, nombre: 'Beca por Excelencia Académica', tipo: 'Académica', monto: 250, requisitos: ['Promedio mínimo 8.5', 'Récord académico', 'Cédula'] },
    estado: 'En revisión',
    fechaPostulacion: '2026-06-20',
    fechaUltimaRevision: '2026-07-01',
    observaciones: 'La solicitud fue recibida y se están validando los documentos cargados.',
    documentosPendientes: [],
    notificaciones: ['Solicitud enviada correctamente.', 'Documentos asignados a revisión.']
  },
  {
    id: 2,
    codigo: 'ULEAM-BECA-2026-002',
    estudiante: { id: 2, cedula: '1309876543', nombre: 'Carlos Mera', carrera: 'Software', semestre: 4, promedio: 8.7 },
    beca: { id: 2, nombre: 'Beca Socioeconómica', tipo: 'Socioeconómica', monto: 180, requisitos: ['Ficha socioeconómica', 'Planilla de luz', 'Cédula'] },
    estado: 'Corrección requerida',
    fechaPostulacion: '2026-06-18',
    fechaUltimaRevision: '2026-06-30',
    observaciones: 'Debe volver a subir la planilla de luz porque el archivo no es legible.',
    documentosPendientes: ['Planilla de luz actualizada'],
    notificaciones: ['Documento observado.', 'Tiene 3 días para corregir la información.']
  },
  {
    id: 3,
    codigo: 'ULEAM-BECA-2026-003',
    estudiante: { id: 3, cedula: '1355511122', nombre: 'Andrea López', carrera: 'Software', semestre: 4, promedio: 9.4 },
    beca: { id: 3, nombre: 'Beca Deportiva', tipo: 'Deportiva', monto: 200, requisitos: ['Certificado deportivo', 'Récord académico', 'Cédula'] },
    estado: 'Aprobada',
    fechaPostulacion: '2026-06-10',
    fechaUltimaRevision: '2026-06-28',
    observaciones: 'La beca fue aprobada para el periodo académico 2026-1.',
    documentosPendientes: [],
    notificaciones: ['Solicitud aprobada.', 'Acercarse a bienestar estudiantil para confirmar datos bancarios.']
  }
];
