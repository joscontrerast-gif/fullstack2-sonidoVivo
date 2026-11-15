import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../../api/authApi.js';
import { EVENTO_SESION_EXPIRADA } from '../../api/http.js';
import { borrarSesion, guardarSesion, leerSesion } from '../../api/sesion.js';

// Roles que pueden entrar al panel de administración
export const ROLES_PANEL = ['ADMINISTRADOR', 'VENDEDOR'];

// Valor por defecto: sin sesión. Permite renderizar componentes sueltos
// (por ejemplo en pruebas) sin tener que envolverlos en AuthProvider.
const SIN_SESION = {
  sesion: null,
  usuario: null,
  iniciarSesion: async () => {
    throw new Error('AuthProvider no está disponible.');
  },
  cerrarSesion: () => {},
};

const AuthContext = createContext(SIN_SESION);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion());

  // Si el backend responde 401 (token vencido) se cierra la sesión.
  useEffect(() => {
    const alExpirar = () => setSesion(null);

    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);

    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  const iniciarSesion = useCallback(async (correo, password) => {
    const respuesta = await authApi.iniciarSesion(correo, password);

    guardarSesion(respuesta);
    setSesion(leerSesion());

    return respuesta.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarSesion();
    setSesion(null);
  }, []);

  const valor = useMemo(
    () => ({
      sesion,
      usuario: sesion?.usuario ?? null,
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
