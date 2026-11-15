import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';

const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

function validar(formulario) {
  const errores = {};
  const nombre = formulario.nombre.trim();
  const correo = formulario.correo.trim();
  const comentario = formulario.comentario.trim();

  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length > 100) errores.nombre = 'El nombre no puede superar los 100 caracteres.';

  if (!correo) errores.correo = 'El correo es obligatorio.';
  else if (correo.length > 100) errores.correo = 'El correo no puede superar los 100 caracteres.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = 'Ingresa un correo con formato válido.';
  else if (!DOMINIOS_PERMITIDOS.includes(correo.split('@')[1].toLowerCase()))
    errores.correo = 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com';

  if (!comentario) errores.comentario = 'El comentario es obligatorio.';
  else if (comentario.length > 500) errores.comentario = 'El comentario no puede superar los 500 caracteres.';

  return errores;
}

function Contacto() {
  const [formulario, setFormulario] = useState({ nombre: '', correo: '', comentario: '' });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
    setEnviado(false);
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    const nuevosErrores = validar(formulario);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      setEnviado(true);
      setFormulario({ nombre: '', correo: '', comentario: '' });
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <div className="row g-4">
          <section className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h3 fw-bold mb-3">Contáctanos</h1>
                <p className="text-secondary">
                  ¿Tienes una consulta sobre un producto o quieres agendar una hora de
                  servicio técnico? Escríbenos y te responderemos a la brevedad.
                </p>

                {enviado && (
                  <div className="alert alert-success" role="alert">
                    Mensaje enviado correctamente. Te responderemos pronto.
                  </div>
                )}

                <form onSubmit={manejarEnvio} noValidate>
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      maxLength={100}
                      className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                      value={formulario.nombre}
                      onChange={manejarCambio}
                    />
                    <div className="invalid-feedback">{errores.nombre}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo</label>
                    <input
                      id="correo"
                      name="correo"
                      type="email"
                      maxLength={100}
                      className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                      value={formulario.correo}
                      onChange={manejarCambio}
                    />
                    <div className="invalid-feedback">{errores.correo}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="comentario" className="form-label">Comentario</label>
                    <textarea
                      id="comentario"
                      name="comentario"
                      rows={5}
                      maxLength={500}
                      className={`form-control ${errores.comentario ? 'is-invalid' : ''}`}
                      value={formulario.comentario}
                      onChange={manejarCambio}
                    />
                    <div className="invalid-feedback">{errores.comentario}</div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Enviar mensaje
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section className="col-lg-5">
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold mb-3">Datos de contacto</h2>
                <p className="mb-1">Teléfono: +56 9 1234 5678</p>
                <p className="mb-1">Correo: contacto@sonidovivo.cl</p>
                <p className="mb-0">Dirección: Av. Valparaíso 123, Viña del Mar</p>
              </div>
            </div>
            <div className="card shadow-sm overflow-hidden">
              <iframe
                title="Ubicación Sonido Vivo"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3345.249232328849!2d-71.5608721!3d-33.0235637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689ddfd2df9360f%3A0x880c401dcbc2ebad!2sAv.%20Valpara%C3%ADso%20123%2C%20Vi%C3%B1a%20del%20Mar%2C%20Valpara%C3%ADso!5e0!3m2!1ses-419!2scl!4v1789315760571!5m2!1ses-419!2scl"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Contacto;