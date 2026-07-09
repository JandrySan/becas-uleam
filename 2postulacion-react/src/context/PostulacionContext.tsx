import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DocumentoCargado } from '../types/documento';

const CLAVES_ALMACENAMIENTO = {
  datosElegibilidad: 'becas_datos_estudiante', nombre: 'becas_nombre', email: 'becas_email', documents: 'becas_documents',
};

interface EstadoPostulacion {
  nombre: string; email: string; cedula: string; telefono: string; carrera: string; semestre: number; promedio: number;
  ingreso: number; cargaFamiliar: number; quintil: number; padreNombre: string; madreNombre: string; hermanos: number; vivienda: string;
  documentos: Record<string, DocumentoCargado>;
}
interface PostulacionContextType {
  estado: EstadoPostulacion;
  actualizarCampo: (campo: keyof Omit<EstadoPostulacion, 'documentos'>, valor: string | number) => void;
  actualizarNombre: (nombre: string) => void;
  actualizarEmail: (email: string) => void;
  actualizarDocumento: (key: string, documento: DocumentoCargado) => void;
  eliminarDocumento: (key: string) => void;
  limpiarDatos: () => void;
}
const PostulacionContext = createContext<PostulacionContextType | undefined>(undefined);
const estadoVacio: EstadoPostulacion = { nombre:'', email:'', cedula:'', telefono:'', carrera:'', semestre:1, promedio:0, ingreso:0, cargaFamiliar:1, quintil:1, padreNombre:'', madreNombre:'', hermanos:0, vivienda:'', documentos:{} };
function mezclarDatos(prev: EstadoPostulacion, datos: any, documentos?: Record<string, DocumentoCargado>): EstadoPostulacion {
  if (!datos) return { ...prev, documentos: documentos || prev.documentos };
  return {
    ...prev,
    nombre: datos.nombreCompleto || [datos.nombres, datos.apellidos].filter(Boolean).join(' ') || '',
    email: datos.correo || datos.email || '',
    cedula: datos.cedula || '',
    telefono: datos.telefono || '',
    carrera: datos.carrera || '',
    semestre: Number(datos.semestre || 1),
    promedio: Number(datos.promedio || 0),
    ingreso: Number(datos.ingreso || 0),
    cargaFamiliar: Number(datos.cargaFamiliar || 1),
    quintil: Number(datos.quintil || 1),
    padreNombre: datos.padreNombre || '',
    madreNombre: datos.madreNombre || '',
    hermanos: Number(datos.hermanos || 0),
    vivienda: datos.vivienda || '',
    documentos: documentos || prev.documentos,
  };
}
function leerDatosIniciales(): EstadoPostulacion {
  let documentos: Record<string, DocumentoCargado> = {}; let datos: any = {};
  try { documentos = JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.documents) || '{}'); } catch {}
  try { datos = JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.datosElegibilidad) || '{}'); } catch {}
  return mezclarDatos({ ...estadoVacio, nombre: localStorage.getItem(CLAVES_ALMACENAMIENTO.nombre) || '', email: localStorage.getItem(CLAVES_ALMACENAMIENTO.email) || '' }, datos, documentos);
}
export function PostulacionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoPostulacion>(leerDatosIniciales);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data: any = event.data || {};
      if (data.tipo === 'BECAS_PORTAL_STATE') setEstado(prev => mezclarDatos(prev, data.datos, data.documentos));
      if (data.tipo === 'BECAS_DATOS_ESTUDIANTE') setEstado(prev => mezclarDatos(prev, data.datos));
    };
    window.addEventListener('message', handler);
    window.parent?.postMessage({ tipo: 'BECAS_REACT_READY' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);
  useEffect(() => {
    const datos = { nombreCompleto: estado.nombre, correo: estado.email, cedula: estado.cedula, telefono: estado.telefono, carrera: estado.carrera, semestre: estado.semestre, promedio: estado.promedio, ingreso: estado.ingreso, cargaFamiliar: estado.cargaFamiliar, quintil: estado.quintil, padreNombre: estado.padreNombre, madreNombre: estado.madreNombre, hermanos: estado.hermanos, vivienda: estado.vivienda };
    localStorage.setItem(CLAVES_ALMACENAMIENTO.nombre, estado.nombre);
    localStorage.setItem(CLAVES_ALMACENAMIENTO.email, estado.email);
    localStorage.setItem(CLAVES_ALMACENAMIENTO.documents, JSON.stringify(estado.documentos));
    localStorage.setItem(CLAVES_ALMACENAMIENTO.datosElegibilidad, JSON.stringify(datos));
    window.parent?.postMessage({ tipo: 'BECAS_POSTULACION_UPDATE', datos, documentos: estado.documentos }, '*');
  }, [estado]);
  const actualizarCampo = (campo: keyof Omit<EstadoPostulacion, 'documentos'>, valor: string | number) => setEstado(prev => ({ ...prev, [campo]: valor }));
  const actualizarNombre = (nombre: string) => actualizarCampo('nombre', nombre);
  const actualizarEmail = (email: string) => actualizarCampo('email', email);
  const actualizarDocumento = (key: string, documento: DocumentoCargado) => setEstado(prev => ({ ...prev, documentos: { ...prev.documentos, [key]: documento } }));
  const eliminarDocumento = (key: string) => setEstado(prev => { const nuevosDocs = { ...prev.documentos }; delete nuevosDocs[key]; return { ...prev, documentos: nuevosDocs }; });
  const limpiarDatos = () => setEstado(estadoVacio);
  return <PostulacionContext.Provider value={{ estado, actualizarCampo, actualizarNombre, actualizarEmail, actualizarDocumento, eliminarDocumento, limpiarDatos }}>{children}</PostulacionContext.Provider>;
}
export function usePostulacion() { const context = useContext(PostulacionContext); if (!context) throw new Error('usePostulacion debe usarse dentro de PostulacionProvider'); return context; }
export type { EstadoPostulacion };
