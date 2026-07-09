import { useState } from 'react';
import requisitosData from '../data/requisitos.json';
import { usePostulacion } from '../context/PostulacionContext';
import type { DocumentoRequerido } from '../types/documento';
import { supabase } from '../services/supabase';

const requisitos = requisitosData as DocumentoRequerido[];

export default function VistaPrevia() {
  const { estado } = usePostulacion();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const obtenerNombreDocumento = (key: string) => {
    const doc = estado.documentos[key] as any;

    return (
      doc?.fileName ||
      doc?.nombre ||
      doc?.name ||
      doc?.archivo?.name ||
      doc?.file?.name ||
      'No cargado'
    );
  };

  const todosCargados = requisitos.every((r) => obtenerNombreDocumento(r.key) !== 'No cargado');

  async function enviarPostulacion() {
    setMensaje('');

    if (!todosCargados) {
      setMensaje('Debe cargar todos los documentos antes de enviar la postulación.');
      return;
    }

    const datosEstudiante = JSON.parse(
      localStorage.getItem('becas_datos_estudiante') || '{}'
    );

    const promedio = Number(datosEstudiante.promedio || estado.promedio || 8.5);
    const ingresos = Number(datosEstudiante.ingreso || estado.ingreso || 400);

    try {
      setEnviando(true);

      const { data: solicitud, error: errorSolicitud } = await supabase
        .from('solicitudes')
        .insert({
          user_id: null,
          beca_id: 1,
          promedio,
          ingresos,
          estado: 'pendiente',
          observacion: 'Postulación enviada desde el módulo React.'
        })
        .select()
        .single();

      if (errorSolicitud) throw errorSolicitud;

      const documentos = requisitos.map((requisito) => ({
        solicitud_id: solicitud.id,
        nombre: requisito.nombre || requisito.key,
        url: obtenerNombreDocumento(requisito.key),
        estado: 'cargado'
      }));

      const { error: errorDocumentos } = await supabase
        .from('documentos')
        .insert(documentos);

      if (errorDocumentos) throw errorDocumentos;

      const { error: errorSeguimiento } = await supabase
        .from('seguimiento')
        .insert({
          solicitud_id: solicitud.id,
          estado: 'pendiente',
          comentario: 'Solicitud recibida y pendiente de revisión.'
        });

      if (errorSeguimiento) throw errorSeguimiento;

      localStorage.setItem('becas_solicitud_id', String(solicitud.id));

      setMensaje('Postulación enviada correctamente.');
      window.parent?.postMessage({ modulo: 'seguimiento' }, '*');
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo enviar la postulación. Revise Supabase o RLS.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="contenedor-pagina">
      <section className="documentos-seccion">
        <h2>👁️ Vista previa</h2>

        <div className="lista-documentos">
          {requisitos.map((requisito) => {
            const nombreDoc = obtenerNombreDocumento(requisito.key);
            const cargado = nombreDoc !== 'No cargado';

            return (
              <div key={requisito.id} className="item-documento-enlace enlace-documento">
                {cargado ? '✅' : '⚠️'} {requisito.nombre || requisito.key}: {nombreDoc}
              </div>
            );
          })}
        </div>

        <button onClick={enviarPostulacion} disabled={!todosCargados || enviando}>
          {enviando ? 'Enviando...' : 'Enviar postulación'}
        </button>

        {mensaje && <p><strong>{mensaje}</strong></p>}
      </section>
    </main>
  );
}