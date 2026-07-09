import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Navigate } from 'react-router-dom'
import ListadoDocumentos from './pages/ListadoDocumentos'
import DetalleDocumento from './pages/DetalleDocumento'
import VistaPrevia from './pages/VistaPrevia'
import './App.css'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/documentos" replace />} />
        <Route path="/documentos" element={<ListadoDocumentos />} />
        <Route path="/documentos/:id" element={<DetalleDocumento />} />
        <Route path="/resumen" element={<VistaPrevia />} />
      </Routes>
    </>
  )
}
