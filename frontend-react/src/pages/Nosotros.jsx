import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const horarios = [
  { dia: 'Lunes a Viernes', hora: '10:00 - 19:00' },
  { dia: 'Sábado', hora: '10:00 - 14:00' },
  { dia: 'Domingo', hora: 'Cerrado' },
];

const equipo = [
  { nombre: 'Jose Contreras', rol: 'Tienda principal, catálogo y carrito de compras' },
  { nombre: 'Matias Peña', rol: 'Módulo administrador y mantenedores (CRUD)' },
  { nombre: 'Sofia Caceres', rol: 'Vistas informativas, formularios y estilos' },
];

function Nosotros() {
  return (
    <>
      <Navbar />
      <main className="container py-5">
        <section className="mb-5">
          <h1 className="fw-bold mb-3">Sobre Sonido Vivo</h1>
          <p>
            Sonido Vivo es una tienda especializada en instrumentos musicales,
            equipos de sonido y accesorios para músicos, ubicada en Viña del Mar,
            Región de Valparaíso. Llevamos 11 años funcionando, atendidos por el
            dueño y dos vendedores.
          </p>
          <p>
            Nuestro catálogo incluye guitarras, bajos, baterías, teclados,
            amplificadores, micrófonos, pedales de efectos y accesorios. También
            ofrecemos reparación de instrumentos de cuerda.
          </p>
        </section>

        <div className="row g-4 mb-5">
          <section className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-3">Horario de atención</h2>
                <table className="table mb-0">
                  <tbody>
                    {horarios.map((horario) => (
                      <tr key={horario.dia}>
                        <th scope="row">{horario.dia}</th>
                        <td>{horario.hora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-3">Servicio técnico y consultas</h2>
                <p className="text-secondary">
                  ¿Quieres consultar por un producto o agendar una hora para reparar
                  tu instrumento?
                </p>
                <Link to="/contacto" className="btn btn-primary">
                  Contacto
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section>
          <h2 className="h4 fw-bold mb-3">Equipo de desarrolladores</h2>
          <p className="text-secondary">
            Proyecto web desarrollado para la Escuela de Informática y Telecomunicaciones.
          </p>
          <ul className="list-group">
            {equipo.map((persona) => (
              <li className="list-group-item" key={persona.nombre}>
                <strong>{persona.nombre}</strong> - {persona.rol}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

export default Nosotros;