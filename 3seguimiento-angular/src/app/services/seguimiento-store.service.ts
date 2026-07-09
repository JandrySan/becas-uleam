import { Injectable, computed, inject, signal } from '@angular/core';
import { EstadoSolicitud, SolicitudBeca } from '../models/beca.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SeguimientoStoreService {
  private supabase = inject(SupabaseService);

  private solicitudesSignal = signal<SolicitudBeca[]>([]);
  filtroEstado = signal<EstadoSolicitud | 'Todos'>('Todos');
  busqueda = signal('');

  solicitudes = this.solicitudesSignal.asReadonly();

  solicitudesFiltradas = computed(() => {
    const estado = this.filtroEstado();
    const texto = this.busqueda().toLowerCase().trim();

    return this.solicitudesSignal().filter((s) =>
      (estado === 'Todos' || s.estado === estado) &&
      (
        s.codigo.toLowerCase().includes(texto) ||
        s.estudiante.nombre.toLowerCase().includes(texto) ||
        s.beca.nombre.toLowerCase().includes(texto) ||
        s.estudiante.cedula.includes(texto)
      )
    );
  });

  totalPendientes = computed(() =>
    this.solicitudesSignal().filter(
      (s) => s.estado === 'En revisión' || s.estado === 'Corrección requerida'
    ).length
  );

  constructor() {
    this.cargarSolicitudesDesdeSupabase();
  }

  async cargarSolicitudesDesdeSupabase(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('solicitudes')
      .select(`
        id,
        beca_id,
        promedio,
        ingresos,
        estado,
        observacion,
        created_at,
        documentos (
          id,
          nombre,
          url,
          estado
        ),
        seguimiento (
          id,
          estado,
          comentario,
          created_at
        ),
        becas (
          id,
          nombre,
          descripcion
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando solicitudes:', error);
      return;
    }

    const solicitudes = (data || []).map((item: any): SolicitudBeca => {
      const documentosPendientes =
        item.documentos?.filter((doc: any) => doc.estado !== 'cargado').map((doc: any) => doc.nombre) || [];

      return {
        id: item.id,
        codigo: `ULEAM-BECA-${String(item.id).padStart(4, '0')}`,
        estado: this.mapearEstado(item.estado),
        fechaPostulacion: item.created_at?.slice(0, 10) || '',
        fechaUltimaRevision: item.created_at?.slice(0, 10) || '',
        observaciones: item.observacion || 'Solicitud registrada desde el módulo React.',
        documentosPendientes,
        estudiante: {
          id: 1,
          nombre: 'Estudiante ULEAM',
          cedula: 'No registrada',
          correo: localStorage.getItem('usuario') || 'No registrado',
          telefono: 'No registrado',
          carrera: 'Software',
          semestre: 6,
          promedio: Number(item.promedio || 0),
          ingreso: Number(item.ingresos || 0),
          cargaFamiliar: 4,
          quintil: 2,
          padreNombre: 'No registrado',
          madreNombre: 'No registrado',
          hermanos: 0,
          vivienda: 'No registrada'
        },
        beca: {
          id: item.becas?.id || item.beca_id || 1,
          nombre: item.becas?.nombre || 'Beca ULEAM',
          tipo: item.becas?.nombre || 'Beca',
          monto: 0,
          requisitos: []
        },

        notificaciones: [
          'Postulación recibida desde el módulo React.',
          'Datos cargados desde Supabase.'
        ]
      
      };
    });

    this.solicitudesSignal.set(solicitudes);
  }

  private mapearEstado(estado: string): EstadoSolicitud {
  if (estado === 'pendiente') return 'Recibida';
  if (estado === 'revision') return 'En revisión';
  if (estado === 'aprobada') return 'Aprobada';
  if (estado === 'rechazada') return 'Rechazada';
  if (estado === 'correccion') return 'Corrección requerida';
  return 'Recibida';
}

  buscarPorId(id: number): SolicitudBeca | undefined {
    return this.solicitudesSignal().find((s) => s.id === id);
  }

 solicitudesPorEstudiante(estudianteId: number): SolicitudBeca[] {
  return this.solicitudesSignal();
}

  actualizarDesdePortal(): void {
    this.cargarSolicitudesDesdeSupabase();
  }

  async cambiarEstado(id: number, estado: EstadoSolicitud): Promise<void> {
    const estadoSupabase = this.estadoParaSupabase(estado);

    const { error } = await this.supabase.client
      .from('solicitudes')
      .update({ estado: estadoSupabase })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando estado:', error);
      return;
    }

    await this.supabase.client.from('seguimiento').insert({
      solicitud_id: id,
      estado: estadoSupabase,
      comentario: `Estado actualizado a ${estado}.`
    });

    await this.cargarSolicitudesDesdeSupabase();
  }

  private estadoParaSupabase(estado: EstadoSolicitud): string {
    if (estado === 'Recibida') return 'pendiente';
    if (estado === 'En revisión') return 'revision';
    if (estado === 'Aprobada') return 'aprobada';
    if (estado === 'Rechazada') return 'rechazada';
    if (estado === 'Corrección requerida') return 'correccion';
    return 'pendiente';
  }

  marcarComoLeida(id: number): void {
    this.solicitudesSignal.update((lista) =>
      lista.map((s) =>
        s.id === id
          ? {
              ...s,
              notificaciones: ['Notificaciones revisadas por el estudiante.', ...s.notificaciones]
            }
          : s
      )
    );
  }
}