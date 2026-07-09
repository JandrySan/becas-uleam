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
      (s) => s.estado === 'Recibida' ||
             s.estado === 'En revisión' ||
             s.estado === 'Corrección requerida'
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
        item.documentos
          ?.filter((doc: any) => doc.estado !== 'cargado')
          .map((doc: any) => doc.nombre) || [];

      let datosObs: any = {};

      try {
        datosObs = JSON.parse(item.observacion || '{}');
      } catch {
        datosObs = {};
      }

      const estudianteObs = datosObs.estudiante || {};
      const observacionTexto =
        datosObs.mensaje ||
        item.observacion ||
        'Solicitud registrada desde el módulo React.';

      return {
        id: item.id,
        codigo: `ULEAM-BECA-${String(item.id).padStart(4, '0')}`,
        estado: this.mapearEstado(item.estado),
        fechaPostulacion: item.created_at?.slice(0, 10) || '',
        fechaUltimaRevision: item.created_at?.slice(0, 10) || '',
        observaciones: observacionTexto,
        documentosPendientes,

        estudiante: {
          id: 1,
          nombre: estudianteObs.nombre || 'Estudiante ULEAM',
          cedula: estudianteObs.cedula || 'No registrada',
          correo: estudianteObs.correo || localStorage.getItem('usuario') || 'No registrado',
          telefono: estudianteObs.telefono || 'No registrado',
          carrera: estudianteObs.carrera || 'Software',
          semestre: Number(estudianteObs.semestre || 6),
          promedio: Number(estudianteObs.promedio || item.promedio || 0),
          ingreso: Number(estudianteObs.ingreso || item.ingresos || 0),
          cargaFamiliar: Number(estudianteObs.cargaFamiliar || 0),
          quintil: Number(estudianteObs.quintil || 0),
          padreNombre: estudianteObs.padreNombre || 'No registrado',
          madreNombre: estudianteObs.madreNombre || 'No registrada',
          hermanos: Number(estudianteObs.hermanos || 0),
          vivienda: estudianteObs.vivienda || 'No registrada'
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

    const solicitudActual = this.buscarPorId(id);
    let observacionAnterior: any = {};

    try {
      observacionAnterior = JSON.parse(solicitudActual?.observaciones || '{}');
    } catch {
      observacionAnterior = {};
    }

    const nuevaObservacion = {
      ...observacionAnterior,
      mensaje: `Estado actualizado a ${estado}.`,
      estudiante: solicitudActual?.estudiante
    };

    this.solicitudesSignal.update((lista) =>
      lista.map((s) =>
        s.id === id
          ? {
              ...s,
              estado,
              fechaUltimaRevision: new Date().toISOString().slice(0, 10),
              observaciones: `Estado actualizado a ${estado}.`,
              notificaciones: [`Estado actualizado a ${estado}.`, ...s.notificaciones]
            }
          : s
      )
    );

    const { error } = await this.supabase.client
      .from('solicitudes')
      .update({
        estado: estadoSupabase,
        observacion: JSON.stringify(nuevaObservacion)
      })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando estado:', error);
      await this.cargarSolicitudesDesdeSupabase();
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