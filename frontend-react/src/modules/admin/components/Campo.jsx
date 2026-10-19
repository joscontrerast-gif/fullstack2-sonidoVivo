// Etiqueta + control + mensaje de error, común a los formularios del panel.
function Campo({ id, etiqueta, error, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">
        {etiqueta}
      </label>
      {children}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}

export default Campo;
