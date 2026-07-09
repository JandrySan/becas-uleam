import { Link } from 'react-router-dom';
import { usePostulacion } from '../context/PostulacionContext';

export default function Navbar() {
  const { estado } = usePostulacion();
  const totalDocumentos = Object.keys(estado.documentos).length;
  const totalRequeridos = 3;

  return (
    <nav className="navbar" aria-label="Navegación de postulación">
      <Link to="/documentos" className="nav-link">
        📥 Documentos ({totalDocumentos}/{totalRequeridos})
      </Link>
      <span className="nav-separator">→</span>
      <Link to="/resumen" className="nav-link">
        👁️ Vista Previa
      </Link>
    </nav>
  );
}
