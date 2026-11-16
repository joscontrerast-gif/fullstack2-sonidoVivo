import { createContext, useContext, useState } from 'react';
import {
  obtenerToken,
  obtenerUsuarioGuardado,
} from '../services/api.js';
import {
  iniciarSesion as loginApi,
  cerrarSesion as logoutApi,
} from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => obtenerToken());
  const [usuario, setUsuario] = useState(() => obtenerUsuarioGuardado());

  async function login(correo, password) {
    const res = await loginApi(correo, password);
    setToken(res.token);
    setUsuario(res.usuario);
    return res;
  }

  function logout() {
    logoutApi();
    setToken(null);
    setUsuario(null);
  }

  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const esVendedor = usuario?.rol === 'VENDEDOR';

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        autenticado: Boolean(token && usuario),
        esAdmin,
        esVendedor,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_POR_DEFECTO = {
  usuario: null,
  autenticado: false,
  esAdmin: false,
  esVendedor: false,
  esEmpleado: false,
  iniciarSesion: async () => {},
  registrarUsuario: async () => {},
  cerrarSesion: () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? AUTH_POR_DEFECTO;
}