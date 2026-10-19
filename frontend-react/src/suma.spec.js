
import { sumar } from './suma.js';

describe('Función sumar', () => {
  it('debe sumar dos números correctamente', () => {
    expect(sumar(2, 3)).toBe(5);
  });

  it('debe funcionar con números negativos', () => {
    expect(sumar(-2, 3)).toBe(1);
  });
});
