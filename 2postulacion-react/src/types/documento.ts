/**
 * Entidad que describe un documento requerido en la solicitud de beca
 */
export interface DocumentoRequerido {
  id: string;
  label: string;
  key: string;
}

/**
 * Entidad que describe un documento cargado por el usuario
 */
export interface DocumentoCargado {
  fileName: string;
  fecha: string;
}
