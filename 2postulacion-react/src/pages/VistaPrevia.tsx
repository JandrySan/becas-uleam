import requisitosData from '../data/requisitos.json';
import { usePostulacion } from '../context/PostulacionContext';
import type { DocumentoRequerido } from '../types/documento';

const requisitos = requisitosData as DocumentoRequerido[];

export default function VistaPrevia() {
  const { estado } = usePostulacion();

  const filas = requisitos.map((requisito) => {
    const documento = estado.documentos[requisito.key];
    const haArchivo = Boolean(documento?.fileName);

    return {
      label: requisito.label,
      fileName: documento?.fileName || 'No cargado',
      estado: haArchivo ? '✓' : 'Pendiente',
      cargado: haArchivo,
    };
  });

  const todosCompletos = filas.every((fila) => fila.cargado);
  return (
    <main className="contenedor-pagina">
      <section className="vista-previa-seccion">
        <h2>👁️ Vista Previa de su Postulación</h2>

        <div className="documentos-resumen">
          <h3>Documentos</h3>
          {filas.length === 0 ? (
            <p className="sin-documentos">(No hay documentos configurados)</p>
          ) : (
            <table className="tabla-preview">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Archivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.label} className={fila.cargado ? 'fila-completa' : 'fila-pendiente'}>
                    <td>{fila.label}</td>
                    <td>{fila.fileName}</td>
                    <td className={fila.cargado ? 'estado-correcto' : 'estado-pendiente'}>{fila.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="resumen-estado">
          {todosCompletos ? (
            <div className="postulacion-lista">
              <p>✅ Su postulación está completa y lista para enviar.</p>
              <button type="button" className="boton-enviar" onClick={() => {
                const datos = { nombreCompleto: estado.nombre, correo: estado.email, cedula: estado.cedula, telefono: estado.telefono, carrera: estado.carrera, semestre: estado.semestre, promedio: estado.promedio, ingreso: estado.ingreso, cargaFamiliar: estado.cargaFamiliar, quintil: estado.quintil, padreNombre: estado.padreNombre, madreNombre: estado.madreNombre, hermanos: estado.hermanos, vivienda: estado.vivienda };
                window.parent?.postMessage({ tipo: 'BECAS_POSTULACION_ENVIADA', modulo: 'seguimiento', datos, documentos: estado.documentos }, '*');
              }}>
                📤 Enviar Postulación
              </button>
            </div>
          ) : (
            <div className="postulacion-incompleta">
              <p>⚠️ Complete la carga de documentos para poder enviar su postulación.</p>
              {!todosCompletos && <p className="detalle-faltante">• Falta cargar algunos documentos</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
