import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { blogs } from '../data/blogs.js';

function Blogs() {
  return (
    <>
      <Navbar />
      <main className="container py-5">
        <h1 className="fw-bold mb-4">Consejos de Sonido Vivo</h1>
        <div className="row g-4">
          {blogs.map((blog) => (
            <div className="col-md-6" key={blog.id}>
              <article className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column p-4">
                  <h2 className="h5 fw-bold">{blog.titulo}</h2>
                  <p className="text-secondary">{blog.resumen}</p>
                  <Link to={`/blogs/${blog.id}`} className="btn btn-primary mt-auto align-self-start">
                    Leer artículo completo
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default Blogs;