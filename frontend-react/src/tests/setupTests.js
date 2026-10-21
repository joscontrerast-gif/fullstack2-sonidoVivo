// Configuración global de las pruebas (Jasmine + Karma).
// Karma carga este archivo antes que cualquier *.spec (ver karma.conf.cjs),
// por lo que estos hooks se aplican a todas las pruebas del proyecto.

import { cleanup } from '@testing-library/react';

// Cada prueba parte con el almacenamiento vacío para que no dependan entre sí.
beforeEach(() => {
  localStorage.clear();
});

// Desmonta los componentes renderizados en la prueba anterior.
afterEach(() => {
  cleanup();
});
