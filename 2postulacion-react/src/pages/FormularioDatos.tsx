import { useState, useEffect } from 'react';
import { usePostulacion } from '../context/PostulacionContext';
import { validarNombre, validarEmail } from '../lib/validaciones';

export default function FormularioDatos() {
  const { estado, actualizarCampo } = usePostulacion();
  const [errores, setErrores] = useState({ nombre: '', email: '' });

  const cambiarTexto = (campo: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    actualizarCampo(campo, e.target.value);
    if (campo === 'nombre') setErrores((prev) => ({ ...prev, nombre: validarNombre(e.target.value) }));
    if (campo === 'email') setErrores((prev) => ({ ...prev, email: validarEmail(e.target.value) }));
  };

  const cambiarNumero = (campo: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    actualizarCampo(campo, Number(e.target.value));
  };

  useEffect(() => {
    setErrores({ nombre: validarNombre(estado.nombre), email: validarEmail(estado.email) });
  }, []);

  return (
    <main className="contenedor-pagina">
      <section className="formulario-seccion">
        <h2>✏️ Datos de postulación</h2>
        <p className="descripcion-pagina">Los campos se autocompletan con la información ingresada en el verificador de elegibilidad.</p>
        <form>
          <div className="grupo-formulario"><label>Nombre completo:</label><input value={estado.nombre} onChange={cambiarTexto('nombre')} required />{errores.nombre && <span className="input-error">{errores.nombre}</span>}</div>
          <div className="grupo-formulario"><label>Correo institucional:</label><input type="email" value={estado.email} onChange={cambiarTexto('email')} required />{errores.email && <span className="input-error">{errores.email}</span>}</div>
          <div className="grupo-formulario"><label>Cédula:</label><input value={estado.cedula} onChange={cambiarTexto('cedula')} /></div>
          <div className="grupo-formulario"><label>Teléfono:</label><input value={estado.telefono} onChange={cambiarTexto('telefono')} /></div>
          <div className="grupo-formulario"><label>Carrera:</label><input value={estado.carrera} onChange={cambiarTexto('carrera')} /></div>
          <div className="grupo-formulario"><label>Semestre:</label><input type="number" value={estado.semestre} onChange={cambiarNumero('semestre')} /></div>
          <div className="grupo-formulario"><label>Promedio:</label><input type="number" step="0.1" value={estado.promedio} onChange={cambiarNumero('promedio')} /></div>
          <div className="grupo-formulario"><label>Ingreso familiar:</label><input type="number" value={estado.ingreso} onChange={cambiarNumero('ingreso')} /></div>
          <div className="grupo-formulario"><label>Carga familiar:</label><input type="number" value={estado.cargaFamiliar} onChange={cambiarNumero('cargaFamiliar')} /></div>
          <div className="grupo-formulario"><label>Quintil:</label><input type="number" value={estado.quintil} onChange={cambiarNumero('quintil')} /></div>
          <div className="grupo-formulario"><label>Nombre del padre:</label><input value={estado.padreNombre} onChange={cambiarTexto('padreNombre')} /></div>
          <div className="grupo-formulario"><label>Nombre de la madre:</label><input value={estado.madreNombre} onChange={cambiarTexto('madreNombre')} /></div>
          <div className="grupo-formulario"><label>Número de hermanos:</label><input type="number" value={estado.hermanos} onChange={cambiarNumero('hermanos')} /></div>
          <div className="grupo-formulario"><label>Vivienda:</label><input value={estado.vivienda} onChange={cambiarTexto('vivienda')} /></div>
        </form>
      </section>
    </main>
  );
}
