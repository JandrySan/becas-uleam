import { Injectable, computed, signal } from '@angular/core';
import { SOLICITUDES_MOCK } from '../data/solicitudes.mock';
import { EstadoSolicitud, SolicitudBeca } from '../models/beca.model';

function documentosPendientesDesdeDocs(documentos: any): string[] {
  const pendientes: string[] = [];
  if (!documentos?.cedula) pendientes.push('Cédula');
  if (!documentos?.record) pendientes.push('Récord académico');
  if (!documentos?.planilla) pendientes.push('Planilla de luz');
  return pendientes;
}
function aplicarDatos(listaBase: SolicitudBeca[], datos: any, documentos?: any): SolicitudBeca[] {
  const lista = structuredClone(listaBase) as SolicitudBeca[];
  if (!datos) return lista;
  const pendientes = documentos ? documentosPendientesDesdeDocs(documentos) : lista[0].documentosPendientes;
  lista[0] = {
    ...lista[0],
    estudiante: {
      ...lista[0].estudiante,
      id: 1,
      nombre: datos.nombreCompleto || [datos.nombres, datos.apellidos].filter(Boolean).join(' ') || lista[0].estudiante.nombre,
      cedula: datos.cedula || lista[0].estudiante.cedula,
      carrera: datos.carrera || lista[0].estudiante.carrera,
      semestre: Number(datos.semestre || lista[0].estudiante.semestre),
      promedio: Number(datos.promedio || lista[0].estudiante.promedio),
      correo: datos.correo || datos.email || '',
      telefono: datos.telefono || '',
      ingreso: Number(datos.ingreso || 0),
      cargaFamiliar: Number(datos.cargaFamiliar || 0),
      quintil: Number(datos.quintil || 0),
      padreNombre: datos.padreNombre || '',
      madreNombre: datos.madreNombre || '',
      hermanos: Number(datos.hermanos || 0),
      vivienda: datos.vivienda || ''
    },
    beca: {
      ...lista[0].beca,
      nombre: Number(datos.promedio || 0) >= 8.5 ? 'Beca por Excelencia Académica' : 'Beca Socioeconómica',
      tipo: Number(datos.promedio || 0) >= 8.5 ? 'Académica' : 'Socioeconómica'
    },
    estado: pendientes.length ? 'Corrección requerida' : 'En revisión',
    observaciones: pendientes.length ? 'La postulación fue recibida, pero aún faltan documentos por completar.' : 'La solicitud fue recibida y se están validando los documentos cargados.',
    documentosPendientes: pendientes,
    notificaciones: ['Postulación recibida desde el módulo React.', 'Datos del verificador Vue vinculados al seguimiento.']
  };
  return lista;
}
function construirSolicitudesIniciales(): SolicitudBeca[] {
  try {
    const datos = JSON.parse(localStorage.getItem('becas_datos_estudiante') || 'null');
    const docs = JSON.parse(localStorage.getItem('becas_documents') || 'null');
    return aplicarDatos(SOLICITUDES_MOCK, datos, docs);
  } catch { return structuredClone(SOLICITUDES_MOCK) as SolicitudBeca[]; }
}
@Injectable({ providedIn: 'root' })
export class SeguimientoStoreService {
  private solicitudesSignal = signal<SolicitudBeca[]>(construirSolicitudesIniciales());
  filtroEstado = signal<EstadoSolicitud | 'Todos'>('Todos');
  busqueda = signal('');
  solicitudes = this.solicitudesSignal.asReadonly();
  solicitudesFiltradas = computed(() => {
    const estado = this.filtroEstado(); const texto = this.busqueda().toLowerCase().trim();
    return this.solicitudesSignal().filter((s) => (estado === 'Todos' || s.estado === estado) && (s.codigo.toLowerCase().includes(texto) || s.estudiante.nombre.toLowerCase().includes(texto) || s.beca.nombre.toLowerCase().includes(texto) || s.estudiante.cedula.includes(texto)));
  });
  totalPendientes = computed(() => this.solicitudesSignal().filter((s) => s.estado === 'En revisión' || s.estado === 'Corrección requerida').length);
  buscarPorId(id: number): SolicitudBeca | undefined { return this.solicitudesSignal().find((s) => s.id === id); }
  solicitudesPorEstudiante(estudianteId: number): SolicitudBeca[] { return this.solicitudesSignal().filter((s) => s.estudiante.id === estudianteId); }
  actualizarDesdePortal(datos: any, documentos?: any): void {
    if (!datos) return;
    localStorage.setItem('becas_datos_estudiante', JSON.stringify(datos));
    if (documentos) localStorage.setItem('becas_documents', JSON.stringify(documentos));
    this.solicitudesSignal.set(aplicarDatos(SOLICITUDES_MOCK, datos, documentos));
  }
  cambiarEstado(id: number, estado: EstadoSolicitud): void { this.solicitudesSignal.update((lista) => lista.map((s) => s.id === id ? { ...s, estado, fechaUltimaRevision: '2026-07-03', notificaciones: [`Estado actualizado a ${estado}.`, ...s.notificaciones] } : s)); }
  marcarComoLeida(id: number): void { this.solicitudesSignal.update((lista) => lista.map((s) => s.id === id ? { ...s, notificaciones: ['Notificaciones revisadas por el estudiante.', ...s.notificaciones] } : s)); }
}
