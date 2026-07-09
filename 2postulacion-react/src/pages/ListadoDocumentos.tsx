import { Link } from 'react-router-dom';
import requisitosData from '../data/requisitos.json';
import { usePostulacion } from '../context/PostulacionContext';
import ItemChecklist from '../components/ItemChecklist';
import type { DocumentoRequerido } from '../types/documento';

const requisitos = requisitosData as DocumentoRequerido[];

export default function ListadoDocumentos() {
  const { estado } = usePostulacion();

  return (
    <main className="contenedor-pagina">
      <section className="documentos-seccion">
        <h2>📥 Documentos Requeridos</h2>
        <p className="descripcion-pagina">
          Haga clic en cada documento para cargarlo. Verifique que sea un archivo PDF válido y no exceda
          el peso máximo.
        </p>

        <div className="lista-documentos">
          {requisitos.map((requisito) => {
            const estaCargado = Boolean(estado.documentos[requisito.key]);
            return (
              <Link key={requisito.id} to={`/documentos/${requisito.id}`} className="item-documento-enlace enlace-documento">
                <ItemChecklist requisito={requisito} cargado={estaCargado} />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}