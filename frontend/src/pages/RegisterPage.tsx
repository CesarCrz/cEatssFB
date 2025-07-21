import React, { useState } from 'react'; // Importamos useState
import { Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { createUserWithEmailAndPassword, type UserCredential } from 'firebase/auth'; // Importamos la función de autenticación y UserCredential type con type-only import
import { ref, set } from 'firebase/database'; // Importamos ref y set de Realtime Database

import { auth, database } from '../firebase-config'; // Importamos las instancias de auth y database

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  const navigate = useNavigate(); // Hook para navegar

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenir la recarga de la página
    setError(null); // Limpiar errores previos

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Si el registro es exitoso, userCredential.user contiene la información del nuevo usuario
      console.log("Usuario registrado:", userCredential.user);

      // --- Guardar información adicional del usuario en la Realtime Database ---
      const userRef = ref(database, 'users/' + userCredential.user.uid);
      await set(userRef, {
         email: userCredential.user.email,
         role: 'cliente', // Asignar 'cliente' por defecto al registrarse desde esta interfaz
         // Puedes añadir otros campos del formulario de registro aquí si los implementas (ej: name, phoneNumber)
      });
      console.log("Información del usuario guardada en la base de datos.");
      // --- Fin de la lógica de guardar en Realtime Database ---


      // Redirigir al usuario después de un registro exitoso
      // TODO: Considerar redirigir a una página para completar perfil o seleccionar restaurante
      navigate('/'); // Redirigir a la página de inicio o donde sea apropiado

    } catch (error: any) {
      // Manejar errores de registro
      console.error("Error al registrar usuario:", error.message);
       if (error.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está en uso.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Formato de correo electrónico inválido.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('El registro con correo y contraseña no está habilitado. Contacta al administrador.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('Error al registrar usuario. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"> { /* Fondo adaptable a modo oscuro */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700"> { /* Bordes y sombra mejorada */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 dark:text-white">Crear Cuenta</h2> { /* Tipografía más grande y bold */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert"> { /* Estilo mejorado para errores */}
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4"> { /* Espacio entre elementos del formulario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email"> { /* Tipografía de label */}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password"> { /* Tipografía de label */}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirm-password"> { /* Tipografía de label */}
              Confirmar Contraseña
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" // Estilo de input mejorado
              id="confirm-password"
              type="password"
              placeholder="********" // Placeholder más conciso
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {/* Podríamos añadir campos adicionales como Nombre, Número de Teléfono, etc. aquí */}
          <div className="flex items-center justify-between">
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800" // Estilo de botón mejorado (verde)
              type="submit"
            >
              Registrarse
            </button>
          </div>
        </form>
        <div className="text-center mt-6"> { /* Espacio superior */}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"> { /* Estilo de enlace mejorado */}
            ¿Ya tienes cuenta? Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;