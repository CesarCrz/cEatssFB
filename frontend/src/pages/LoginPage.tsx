import React, { useState } from 'react'; // Importamos useState
import { useNavigate, Link } from 'react-router-dom'; // Importamos useNavigate para redirigir
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importamos la función de autenticación
import { auth } from '../firebase-config'; // Importamos la instancia de auth

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores de autenticación

  const navigate = useNavigate(); // Hook para navegar

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenir la recarga de la página
    setError(null); // Limpiar errores previos

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Si el inicio de sesión es exitoso, userCredential.user contiene la información del usuario
      console.log("Usuario inició sesión:", userCredential.user);

      // TODO: Redirigir al usuario según su rol (cliente, restaurante, admin)
      // Esto se implementará más adelante después de leer el rol de la BD
      navigate('/'); // Redirigir temporalmente

    } catch (error: any) {
      // Manejar errores de autenticación
      console.error("Error al iniciar sesión:", error.message);
      if (error.code === 'auth/invalid-email') {
        setError('Formato de correo electrónico inválido.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Este usuario ha sido deshabilitado.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Usuario no encontrado. Verifica el correo.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"> {/* Fondo adaptable a modo oscuro */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700"> {/* Bordes y sombra mejorada */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 dark:text-white">Iniciar Sesión</h2> {/* Tipografía más grande y bold */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert"> {/* Estilo mejorado para errores */}
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4"> {/* Espacio entre elementos del formulario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email"> {/* Tipografía de label */}
              Correo Electrónico
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" // Estilo de input mejorado
              id="email"
              type="email"
              placeholder="ejemplo@correo.com" // Placeholder más descriptivo
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password"> {/* Tipografía de label */}
              Contraseña
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" // Estilo de input mejorado
              id="password"
              type="password"
              placeholder="********" // Placeholder más conciso
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800" // Estilo de botón mejorado, ancho completo
              type="submit"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
        <div className="text-center mt-6"> {/* Espacio superior */}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"> {/* Estilo de enlace mejorado */}
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
