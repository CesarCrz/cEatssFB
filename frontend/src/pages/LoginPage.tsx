import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, type User } from 'firebase/auth';
import { ref, get, child, DataSnapshot } from 'firebase/database'; // Importamos funciones para leer de Realtime Database

import { auth, database } from '../firebase-config'; // Importamos las instancias de auth y database

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Estado para indicar que estamos cargando (ej. leyendo rol)

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Indicar que estamos procesando

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user: User | null = userCredential.user;

      console.log("Usuario inició sesión:", user);

      if (user) {
          console.log(`Fetching role for user UID: ${user.uid}`);
          // --- Leer el rol del usuario de la Realtime Database ---
          const userRef = ref(database, 'users'); // Referencia a la rama 'users'
          const userSnapshot: DataSnapshot = await get(child(userRef, user.uid)); // Obtener los datos del usuario por UID

          if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              const userRole: string | undefined = userData?.role;
              const userRestaurantId: string | undefined = userData?.restaurantId; // Obtener el restaurantId si existe

              console.log("User data from DB:", userData);
              console.log("User role:", userRole);

              // --- Redirigir condicionalmente basado en el rol ---
              if (userRole === 'restaurante' && userRestaurantId) {
                  console.log(`Redirecting to restaurant dashboard for ID: ${userRestaurantId}`);
                  navigate(`/dashboard/restaurant/${userRestaurantId}`, { replace: true }); // Redirigir a panel restaurante
              } else if (userRole === 'admin') {
                  console.log("Redirecting to admin dashboard.");
                  navigate('/dashboard/admin', { replace: true }); // Redirigir a panel admin
              } else {
                  // Rol 'cliente' u otro rol no autorizado para acceder a paneles en esta app
                  // O usuario sin rol definido
                   console.log(`User role "${userRole}" not authorized for dashboards or missing restaurantId.`);
                   // TODO: Implementar logout si el rol no es válido para esta app
                   setError("Tu cuenta no tiene permisos para acceder a este panel."); // Mostrar error
                   setLoading(false); // Detener carga
              }

          } else {
              // Usuario autenticado pero no encontrado en la rama /users de la BD
              console.error(`User data not found in /users/${user.uid} in the database.`);
              setError("Error: Datos de usuario incompletos. Contacta al administrador."); // Mostrar error
              // TODO: Considerar logout automático aquí
              setLoading(false); // Detener carga
          }

      } else {
          // Si userCredential.user es null después de un inicio de sesión exitoso (situación inesperada)
          console.error("Login successful, but user object is null.");
          setError("Error en el inicio de sesión. Inténtalo de nuevo."); // Mostrar un error general
          setLoading(false); // Detener carga
      }


    } catch (error: any) {
      console.error("Error al iniciar sesión:", error); // Log detallado del objeto de error

      // Manejar errores de autenticación y mostrar mensaje
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
       console.log('Error message set:', error.message);
       setLoading(false); // Detener carga en caso de error de auth
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
              disabled={loading} // Deshabilitar input mientras carga
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
              disabled={loading} // Deshabilitar input mientras carga
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50" // Estilo de botón mejorado, ancho completo, y disabled style
              type="submit"
              disabled={loading} // Deshabilitar botón mientras carga
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'} {/* Texto del botón cambia mientras carga */}
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
