import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import requisitosData from '../data/requisitos.json';
import { usePostulacion } from '../context/PostulacionContext';
import { validarArchivoPdf, type LimitesDocumento } from '../lib/validaciones';
import type { DocumentoRequerido } from '../types/documento';

const requisitos = requisitosData as DocumentoRequerido[];

const mapaLlavesDocumento: Record<string, keyof LimitesDocumento> = {
  doc_identidad: 'cedula',
  cert_notas: 'record',
  planilla_luz: 'planilla',
};

export default function DetalleDocumento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { estado, actualizarDocumento, eliminarDocumento } = usePostulacion();
  const [error, setError] = useState('');
  const [archivo, setArchivo] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requisito = requisitos.find((r) => r.id === id);

  if (!requisito) {
    return (
      <main className="contenedor-pagina">
        <div className="error-contenedor">
          <p>Documento no encontrado.</p>
        </div>
      </main>
    );
  }

  const key = mapaLlavesDocumento[requisito.id];
  const yaCargado = Boolean(estado.documentos[requisito.key]);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setArchivo(undefined);
      setError('');
      return;
    }

    const file = files[0];
    const validationError = validarArchivoPdf(file, key, yaCargado);

    if (validationError) {
      setError(validationError);
      setArchivo(undefined);
      return;
    }

    setArchivo(file);
    setError('');

    const ahora = new Date().toISOString();
    actualizarDocumento(requisito.key, {
      fileName: file.name,
      fecha: ahora,
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('arrastrar-sobre');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('arrastrar-sobre');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('arrastrar-sobre');
    handleFileChange(e.dataTransfer.files);
  };

  const handleEliminar = () => {
    setArchivo(undefined);
    setError('');
    eliminarDocumento(requisito.key);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const documentoCargado = estado.documentos[requisito.key];

  return (
    <main className="contenedor-pagina">
      <section className="detalle-documento-seccion">
        <h2>{requisito.label}</h2>

        <div className="zona-arrastrar" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="icono-grande">📥</div>
          <span className="texto-arrastrar">Arrastre el archivo aquí o haga clic para seleccionar</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
            accept=".pdf"
            className="entrada-archivo"
          />
        </div>

        {error && <div className="input-error">{error}</div>}

        {(archivo || documentoCargado) && (
          <div className="archivo-cargado">
            <div className="info-archivo">
              <span className="nombre-archivo">
                ✓ {archivo?.name || documentoCargado?.fileName}
              </span>
              {documentoCargado?.fecha && (
                <span className="fecha-archivo">{new Date(documentoCargado.fecha).toLocaleString()}</span>
              )}
            </div>
            <div className="acciones-detalle">
              <button type="button" onClick={handleEliminar} className="boton-eliminar">
                Eliminar
              </button>
              <button type="button" onClick={() => navigate('/documentos')} className="boton-volver">
                Volver al listado
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
