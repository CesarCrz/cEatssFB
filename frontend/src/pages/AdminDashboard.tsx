import React, { useEffect, useState } from 'react'; // Importamos useEffect para cargar lista de restaurantes/usuarios
import { ref, push, set, onValue, DataSnapshot, query, orderByChild, equalTo } from 'firebase/database'; // Importamos ref, push, set, onValue, query, orderByChild, equalTo para la BD
import { useAuth } from '../context/AuthContext'; // Suponiendo que tienes un contexto de autenticación que proporciona currentUser

import { database } from '../firebase-config'; // Importamos la instancia de database
import { getAuth } from 'firebase/auth'; // Importamos getAuth para obtener el usuario autenticado si no usas contexto


// TODO: Definir interfaces para Restaurant y User si aún no lo hemos hecho
interface Restaurant {
    name: string;
    address: string;
    // Añadir otros campos si son relevantes para mostrar/seleccionar
}

interface UserProfile {
    email: string;
    role: string;
    restaurantId?: string; // Para usuarios tipo 'restaurante' o 'admin' de una sola sucursal
    managedRestaurants?: { [key: string]: boolean }; // Para usuarios tipo 'admin' que gestionan múltiples sucursales
    // Añadir otros campos si son relevantes
}


const AdminDashboard: React.FC = () => {
   // --- Estado para Crear Restaurante ---
   const [newRestaurantName, setNewRestaurantName] = useState('');
   const [newRestaurantAddress, setNewRestaurantAddress] = useState('');
   const [creationLoading, setCreationLoading] = useState(false);
   const [creationError, setCreationError] = useState<string | null>(null);
   const [creationSuccess, setCreationSuccess] = useState<string | null>(null);

   // --- Estado para Listar Restaurantes ---
   const [restaurants, setRestaurants] = useState<{ [key: string]: Restaurant }>({});
   const [restaurantsLoading, setRestaurantsLoading] = useState(true);
   const [restaurantsError, setRestaurantsError] = useState<string | null>(null);

   // --- Estado para Crear Usuario de Restaurante ---
   const [newUserEmail, setNewUserEmail] = useState('');
   const [newUserPassword, setNewUserPassword] = useState('');
   const [selectedRestaurantId, setSelectedRestaurantId] = useState(''); // Para asignar el usuario a un restaurante
   const [userCreationLoading, setUserCreationLoading] = useState(false);
   const [userCreationError, setUserCreationError] = useState<string | null>(null);
   const [userCreationSuccess, setUserCreationSuccess] = useState<string | null>(null);

   // --- Estado para Listar Usuarios ---
   const [users, setUsers] = useState<{ [key: string]: UserProfile }>({});
   const [usersLoading, setUsersLoading] = useState(true);
   const [usersError, setUsersError] = useState<string | null>(null);


   // Obtener el usuario autenticado actual
   // Si no usas useAuth, puedes obtenerlo así después de asegurarte de que Firebase Auth está inicializado:
   // const authInstance = getAuth();
   // const currentUser = authInstance.currentUser;
   // Asegúrate de manejar el caso donde currentUser es null si la página es accesible sin login
   const { currentUser } = useAuth(); // Usando el contexto de autenticación

   // Estado para almacenar el perfil del administrador logueado
   const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
   const [adminProfileLoading, setAdminProfileLoading] = useState(true);
   const [adminProfileError, setAdminProfileError] = useState<string | null>(null);


   // --- Efecto para cargar el perfil del administrador logueado ---
   useEffect(() => {
       if (currentUser) {
           const adminRef = ref(database, `users/${currentUser.uid}`);
           const unsubscribe = onValue(adminRef, (snapshot: DataSnapshot) => {
               if (snapshot.exists()) {
                   const profile = snapshot.val() as UserProfile;
                   setAdminProfile(profile);
                   setAdminProfileLoading(false);

                    // Si el admin es de restaurante con un solo restaurantId, precargarlo en selectedRestaurantId para creación de usuarios
                   if (profile.role === 'admin' && profile.restaurantId && !profile.managedRestaurants) { // Asumimos 'admin' con restaurantId es admin de 1 sucursal
                       setSelectedRestaurantId(profile.restaurantId);
                   } else if (profile.role === 'restaurante' && profile.restaurantId) { // Personal de restaurante
                       setSelectedRestaurantId(profile.restaurantId);
                   } else {
                       setSelectedRestaurantId(''); // Si es superadmin o admin con managedRestaurants, dejar selector vacío
                   }

               } else {
                   // Perfil no encontrado (inesperado para un admin logueado)
                   console.error(`Perfil de usuario no encontrado para UID: ${currentUser.uid}`);
                   setAdminProfile(null);
                   setAdminProfileLoading(false);
                   setAdminProfileError("Perfil de administrador no encontrado en la base de datos.");
               }
           }, (error) => {
               console.error("Error al leer perfil de administrador:", error);
               setAdminProfile(null);
               setAdminProfileLoading(false);
               setAdminProfileError("Error al cargar perfil de administrador.");
           });

           return () => {
               unsubscribe();
           };
       } else {
           // No hay usuario autenticado (redireccionar si es necesario en una app real)
           console.log("No hay usuario autenticado. Redirigiendo al login..."); // Placeholder
           setAdminProfile(null);
           setAdminProfileLoading(false);
           setAdminProfileError("No hay usuario autenticado.");
            // Aquí podrías usar navigate('/login', { replace: true });
       }
   }, [currentUser]); // Volver a ejecutar si el usuario autenticado cambia


   // --- Efecto para cargar la lista de restaurantes (MODIFICADO PARA FILTRAR) ---
    useEffect(() => {
         // Solo cargar restaurantes si el perfil del admin ha cargado
         if (adminProfile) {
            const restaurantsRef = ref(database, 'restaurants');
            let restaurantsQuery = query(restaurantsRef); // Consulta base: todos los restaurantes

            // Si es admin de restaurante con managedRestaurants, filtrar por esos IDs
            if (adminProfile.role === 'admin' && adminProfile.managedRestaurants) {
                 console.log(`Admin (${currentUser?.uid}) con managedRestaurants cargando sus restaurantes.`);
                 // Realtime Database no soporta consultas OR complejas directamente para múltiples IDs en una sola consulta onValue
                 // Tendrías que hacer una lectura única o listeners separados para cada restaurantId en managedRestaurants,
                 // O cargar todos y filtrar en el cliente (menos eficiente pero más simple con onValue).
                 // Para mantener la simplicidad con onValue, cargaremos todos y filtraremos en el cliente por ahora.
                 // UNA MEJOR APROXIMACIÓN SERÍA EN EL BACKEND SI TIENES UN ENDPOINT PARA LISTAR RESTAURANTES DEL ADMIN
                 console.warn("Cargando todos los restaurantes y filtrando en el cliente para admin con managedRestaurants. Considerar endpoint backend o listeners múltiples para optimizar.");
            } else if (adminProfile.role === 'admin' && adminProfile.restaurantId && !adminProfile.managedRestaurants) {
                 console.log(`Admin (${currentUser?.uid}) con un solo restaurantId, cargando solo ese restaurante.`);
                  // Si es admin con un solo restaurantId, crear una consulta para ese ID
                  restaurantsQuery = query(
                      restaurantsRef,
                      orderByChild('__key__'), // Ordenar por clave (el ID del restaurante)
                      equalTo(adminProfile.restaurantId) // Filtrar por el restaurantId del admin
                  );
            } else if (adminProfile.role === 'restaurante' && adminProfile.restaurantId) {
                 console.log(`Staff (${currentUser?.uid}) cargando solo su restaurante: ${adminProfile.restaurantId}.`);
                 // Si es staff, cargar solo su restaurante
                  restaurantsQuery = query(
                      restaurantsRef,
                      orderByChild('__key__'),
                      equalTo(adminProfile.restaurantId)
                  );
            } else if (adminProfile.role !== 'admin') {
                console.log(`Usuario (${currentUser?.uid}) con rol ${adminProfile?.role} no tiene permisos para ver restaurantes.`);
                setRestaurants({});
                setRestaurantsLoading(false);
                setRestaurantsError("No tienes permisos para ver restaurantes.");
                return; // Salir del useEffect si no tiene permisos
            } else {
                 console.log(`Superadmin (${currentUser?.uid}) cargando todos los restaurantes.`);
                 // Si es superadmin (role 'admin' sin managedRestaurants o restaurantId), cargar todos
                 restaurantsQuery = ref(database, 'restaurants'); // Vuelve a la referencia base sin filtros
            }


           const unsubscribe = onValue(restaurantsQuery, (snapshot: DataSnapshot) => {
               if (snapshot.exists()) {
                    let fetchedRestaurants = snapshot.val();

                    // Filtrado adicional en el cliente si es un admin con managedRestaurants
                    if (adminProfile && adminProfile.role === 'admin' && adminProfile.managedRestaurants) {
                        const managedRestaurantIds = Object.keys(adminProfile.managedRestaurants);
                        fetchedRestaurants = Object.fromEntries(
                            Object.entries(fetchedRestaurants).filter(([id, restaurant]) => managedRestaurantIds.includes(id))
                        );
                    }


                   setRestaurants(fetchedRestaurants);
                   setRestaurantsLoading(false);
                   setRestaurantsError(null); // Limpiar errores previos si la carga fue exitosa
               } else {
                   setRestaurants({});
                   setRestaurantsLoading(false);
                   setRestaurantsError(null); // No hay error si simplemente no hay datos
               }
           }, (error) => {
               console.error("Error al leer restaurantes:", error);
               setRestaurantsError("No se pudieron cargar los restaurantes.");
               setRestaurantsLoading(false);
           });

           return () => {
               unsubscribe();
           };
        } else if (!adminProfileLoading) {
             // Perfil cargado pero es null o no tiene un rol/asociación válida para ver restaurantes
             console.log("Perfil de admin no cargado o sin permisos para ver restaurantes.");
              setRestaurants({});
              setRestaurantsLoading(false);
              setRestaurantsError("No tienes permisos para ver restaurantes."); // O un mensaje más específico
        }


    }, [adminProfile, adminProfileLoading]); // Volver a ejecutar cuando cambie el perfil del admin


    // --- Efecto para cargar la lista de usuarios (MODIFICADO PARA FILTRAR) ---
    useEffect(() => {
        // Solo cargar usuarios si el perfil del admin ha cargado y tiene permisos
        if (adminProfile) {
            const usersRef = ref(database, 'users');
            let usersQuery = query(usersRef); // Consulta base: todos los usuarios

            // Si es admin de restaurante (con managedRestaurants o un solo restaurantId), filtrar por sus sucursales
            if (adminProfile.role === 'admin' && (adminProfile.managedRestaurants || adminProfile.restaurantId)) {
                 console.log(`Admin (${currentUser?.uid}) con managedRestaurants o restaurantId, cargando usuarios de sus sucursales.`);

                 // Aquí también enfrentamos el problema de consultar con múltiples IDs en Realtime Database.
                 // Idealmente, el backend proporcionaría un endpoint que lista usuarios por restaurantIds gestionados.
                 // Para mantener la simplicidad frontend-only con onValue, cargaremos todos y filtraremos en el cliente.
                 console.warn("Cargando todos los usuarios y filtrando en el cliente para admin con managedRestaurants/restaurantId. Considerar endpoint backend o listeners múltiples para optimizar.");

                 // Consulta base: todos los usuarios (el filtrado ocurrirá en el cliente)
                 usersQuery = ref(database, 'users');

            } else if (adminProfile.role === 'restaurante' && adminProfile.restaurantId) {
                 console.log(`Staff (${currentUser?.uid}) cargando usuarios de su restaurante: ${adminProfile.restaurantId}.`);
                 // Si es staff, cargar solo usuarios de su restaurante
                 usersQuery = query(
                      usersRef,
                      orderByChild('restaurantId'),
                      equalTo(adminProfile.restaurantId)
                  );
            } else if (adminProfile.role !== 'admin') {
                 console.log(`Usuario (${currentUser?.uid}) con rol ${adminProfile?.role} no tiene permisos para ver usuarios.`);
                 setUsers({});
                 setUsersLoading(false);
                 setUsersError("No tienes permisos para ver usuarios.");
                 return;
            } else {
                 console.log(`Superadmin (${currentUser?.uid}) cargando todos los usuarios.`);
                 // Si es superadmin, cargar todos
                 usersQuery = ref(database, 'users'); // Vuelve a la referencia base sin filtros
            }


            const unsubscribe = onValue(usersQuery, (snapshot: DataSnapshot) => {
                if (snapshot.exists()) {
                    let fetchedUsers = snapshot.val();

                     // Filtrado adicional en el cliente si es un admin con managedRestaurants o un solo restaurantId
                    if (adminProfile && adminProfile.role === 'admin' && (adminProfile.managedRestaurants || adminProfile.restaurantId)) {
                        const managedRestaurantIds = adminProfile.managedRestaurants ? Object.keys(adminProfile.managedRestaurants) : (adminProfile.restaurantId ? [adminProfile.restaurantId] : []);
                         fetchedUsers = Object.fromEntries(
                            Object.entries(fetchedUsers).filter(([uid, userProfile]) =>
                                // Incluir usuarios cuyo restaurantId está en la lista gestionada del admin
                                userProfile.restaurantId && managedRestaurantIds.includes(userProfile.restaurantId)
                                // Opcional: Incluir también al propio administrador logueado en la lista de usuarios
                                // || uid === currentUser?.uid
                                // Opcional: Incluir usuarios sin restaurantId (ej: clientes), si el admin de restaurante debe verlos
                                // || !userProfile.restaurantId
                            )
                        );
                         console.log("Usuarios filtrados en el cliente:", fetchedUsers);
                    }


                    setUsers(fetchedUsers);
                    setUsersLoading(false);
                    setUsersError(null); // Limpiar errores previos
                } else {
                    setUsers({});
                    setUsersLoading(false);
                     setUsersError(null); // No hay error si no hay datos
                }
            }, (error) => {
                console.error("Error al leer usuarios:", error);
                setUsersError("No se pudieron cargar los usuarios.");
                setUsersLoading(false);
            });

            return () => {
                unsubscribe();
            };
         } else if (!adminProfileLoading) {
             // Perfil cargado pero es null o sin permisos
              console.log("Perfil de admin no cargado o sin permisos para ver usuarios.");
               setUsers({});
               setUsersLoading(false);
               setUsersError("No tienes permisos para ver usuarios.");
         }


    }, [adminProfile, adminProfileLoading]); // Volver a ejecutar cuando cambie el perfil del admin


   // --- Manejador para Crear Restaurante (LLAMA AL BACKEND) ---
   const handleCreateRestaurant = async () => {
       setCreationLoading(true);
       setCreationError(null);
       setCreationSuccess(null);

       if (!newRestaurantName || !newRestaurantAddress) {
           setCreationError('El nombre y la dirección del restaurante son obligatorios.');
           setCreationLoading(false);
           return;
       }

       // Obtener el token del usuario autenticado
        if (!currentUser) {
            setCreationError("No hay usuario autenticado para crear el restaurante.");
            setCreationLoading(false);
            return;
        }

       try {
           const token = await currentUser.getIdToken(); // Obtener el token de autenticación


           const backendUrl = '/api/createRestaurant'; // Endpoint en tu backend

           console.log(`Calling backend endpoint ${backendUrl} to create restaurant: ${newRestaurantName}`);

           const response = await fetch(backendUrl, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
               },
               body: JSON.stringify({
                   name: newRestaurantName,
                   address: newRestaurantAddress,
               }),
           });

           const result = await response.json(); // Asumimos que el backend responde con JSON

           if (response.ok) { // Verificar si la respuesta HTTP fue exitosa (código 2xx)
               console.log("Backend response (restaurant creation):", result);
               setCreationSuccess(`Restaurante \"${newRestaurantName}\" creado exitosamente. ID: ${result.restaurantId}`); // Mostrar el ID devuelto por el backend

               // Limpiar formulario
               setNewRestaurantName('');
               setNewRestaurantAddress('');

           } else {
               // Manejar errores reportados por el backend
               console.error("Error from backend (restaurant creation):", result);
                setCreationError(`Error al crear restaurante: ${result.message || 'Error desconocido'}`);
           }


       } catch (error: any) {
           console.error("Error calling backend for restaurant creation:", error);
           setCreationError(`Error de conexión o interno al intentar crear el restaurante: ${error.message}`);
       } finally {
           setCreationLoading(false);
       }
   };


    // --- Manejador para Crear Usuario de Restaurante (LLAMA AL BACKEND) ---
    const handleCreateRestaurantUser = async () => {
        setUserCreationLoading(true);
        setUserCreationError(null);
        setUserCreationSuccess(null);

        // Si el admin es de restaurante, usar su restaurantId en lugar del selector
        const finalRestaurantId = adminProfile?.role === 'admin' && adminProfile.restaurantId ? adminProfile.restaurantId : selectedRestaurantId;


        if (!newUserEmail || !newUserPassword || !finalRestaurantId) {
            setUserCreationError('Correo, contraseña y restaurante son obligatorios.');
            setUserCreationLoading(false);
            return;
        }

         // Obtener el token del usuario autenticado
        if (!currentUser) {
            setUserCreationError("No hay usuario autenticado para crear el usuario.");
            setUserCreationLoading(false);
            return;
        }

        try {
            const token = await currentUser.getIdToken(); // Obtener el token de autenticación

            const backendUrl = '/api/createRestaurantUser'; // Endpoint en tu backend

            console.log(`Calling backend endpoint ${backendUrl} to create user: ${newUserEmail} for restaurant ${finalRestaurantId}`);

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Incluir el token
                },
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    restaurantId: finalRestaurantId,
                    role: 'restaurante' // Enviamos el rol deseado
                }),
            });

            const result = await response.json(); // Asumimos que el backend responde con JSON

            if (response.ok) { // Verificar si la respuesta HTTP fue exitosa (código 2xx)
                console.log("Backend response (user creation):", result);
                 setUserCreationSuccess(`Usuario de restaurante \"${newUserEmail}\" creado y asignado exitosamente a ${restaurants[finalRestaurantId]?.name || finalRestaurantId}.`);

                 // Limpiar formulario
                 setNewUserEmail('');
                 setNewUserPassword('');
                 // No limpiar selectedRestaurantId si es un superadmin
                 if (!(adminProfile?.role === 'admin' && adminProfile.restaurantId)) {
                    setSelectedRestaurantId('');
                 }


            } else {
                // Manejar errores reportados por el backend
                console.error("Error from backend (user creation):", result);
                 setUserCreationError(`Error al crear usuario: ${result.message || 'Error desconocido'}`);
            }


        } catch (error: any) {
            console.error("Error calling backend for user creation:", error);
            setUserCreationError(`Error de conexión o interno al intentar crear el usuario: ${error.message}`);
        } finally {
            setUserCreationLoading(false);
        }
    };


  // --- Renderizado ---
   return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra Lateral de Navegación Admin */}
      <div className="w-64 bg-gray-800 dark:bg-gray-950 text-white flex flex-col py-6 px-4">
        <h2 className="text-xl font-semibold mb-6">Panel de Administrador</h2>
        <nav className="space-y-2">
          <div>Gestionar Restaurantes</div>
          <div>Gestionar Usuarios</div>
          <div>Ver Todos los Pedidos</div>
          <div>Reportes Globales</div>
           {/* TODO: Añadir enlace para cerrar sesión */}
           {/* <button onClick={handleLogout}>Cerrar Sesión</button> */}
        </nav>
      </div>

      {/* Área de Contenido Principal del Admin */}
      <div className="flex-1 p-6">
        {/* Mostrar mensaje de error si no se pudo cargar el perfil del admin */}
        {adminProfileError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                {adminProfileError}
            </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Tablero de Administración
             {/* Mostrar rol y nombre del restaurante si aplica */}
             {adminProfileLoading ? "Cargando..." : adminProfile ? (
                 <span>
                      ({adminProfile.role})
                     {adminProfile.role === 'admin' && adminProfile.restaurantId && restaurants[adminProfile.restaurantId] && (
                         <span> - {restaurants[adminProfile.restaurantId].name}</span>
                     )}
                      {adminProfile.role === 'restaurante' && adminProfile.restaurantId && restaurants[adminProfile.restaurantId] && (
                         <span> - {restaurants[adminProfile.restaurantId].name}</span>
                     )}
                 </span>
             ) : "Perfil no cargado"}
        </h1>

        {adminProfileLoading ? (
             <p className="text-gray-600 dark:text-gray-400">Cargando tablero...</p>
        ) : adminProfile ? ( // Solo renderizar el resto del dashboard si el perfil ha cargado

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Sección Crear Nuevo Restaurante - Solo visible para superadmin */}
              {adminProfile.role === 'admin' && !adminProfile.restaurantId && ( // Superadmin no tiene restaurantId en su perfil
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 col-span-full">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Crear Nuevo Restaurante</h3>
                     {creationError && (<div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{creationError}</div>)}
                     {creationSuccess && (<div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-4" role="alert">{creationSuccess}</div>)}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="newRestaurantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Restaurante</label>
                            <input type="text" id="newRestaurantName" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" value={newRestaurantName} onChange={(e) => setNewRestaurantName(e.target.value)} disabled={creationLoading} />
                        </div>
                         <div>
                            <label htmlFor="newRestaurantAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección del Restaurante</label>
                             <input type="text" id="newRestaurantAddress" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" value={newRestaurantAddress} onChange={(e) => setNewRestaurantAddress(e.target.value)} disabled={creationLoading} />
                        </div>
                        <button onClick={handleCreateRestaurant} disabled={creationLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50"> {creationLoading ? 'Creando...' : 'Crear Restaurante'} </button>
                    </div>
                  </div>
              )}


               {/* Sección Gestión de Usuarios - Visible para superadmin o admin de restaurante */}
               {(adminProfile.role === 'admin' || adminProfile.role === 'restaurante') && ( // Visible si es admin o staff de restaurante
                   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 col-span-full">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Gestión de Usuarios de Restaurante</h3>

                      {userCreationError && (<div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{userCreationError}</div>)}
                      {userCreationSuccess && (<div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-4" role="alert">{userCreationSuccess}</div>)}

                      {/* Formulario para Crear Nuevo Usuario de Restaurante - Visible si puede crear usuarios */}
                      {(adminProfile.role === 'admin' || adminProfile.role === 'restaurante') && ( // Ambos roles pueden crear usuarios para su sucursal/sus sucursales
                          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                             <h4 className="text-lg font-medium text-gray-800 dark:text-white">Añadir Nuevo Usuario de Restaurante</h4>
                              <div>
                                 <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                                 <input type="email" id="newUserEmail" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400\" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} disabled={userCreationLoading} />
                             </div>
                              <div>
                                 <label htmlFor=\"newUserPassword\" className=\"block text-sm font-medium text-gray-700 dark:text-gray-300\">Contraseña</label>\n                                 <input type=\"password\" id=\"newUserPassword\" className=\"mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400\" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} disabled={userCreationLoading} />\n                             </div>\n                             {/* Selector de Restaurante - Solo visible si es superadmin (admin sin restaurantId) o admin con managedRestaurants */}
                             {(adminProfile.role === 'admin' && (!adminProfile.restaurantId || adminProfile.managedRestaurants)) && (
                                 <div>
                                     <label htmlFor=\"selectRestaurant\" className=\"block text-sm font-medium text-gray-700 dark:text-gray-300\">Asignar a Restaurante</label>\n                                     <select\n                                        id=\"selectRestaurant\"\n                                        className=\"mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white\"\n                                        value={selectedRestaurantId}\n                                        onChange={(e) => setSelectedRestaurantId(e.target.value)}\n                                        disabled={userCreationLoading || restaurantsLoading || restaurantsError !== null}\n                                     >\n                                         <option value=\"\">-- Selecciona un Restaurante --</option>\n                                         {restaurantsLoading ? (<option value=\"\" disabled>Cargando restaurantes...</option>)\n                                          : restaurantsError ? (<option value=\"\" disabled>{restaurantsError}</option>)\n                                          : Object.keys(restaurants).length > 0 ? (\n                                             // Mostrar solo los restaurantes gestionados por el admin si aplica\n                                             Object.keys(restaurants)\n                                                 .filter(restaurantId =>\n                                                     adminProfile.role === 'admin' && adminProfile.managedRestaurants ?\n                                                     adminProfile.managedRestaurants[restaurantId] : true // Mostrar todos si es superadmin\n                                                 )\n                                                 .map((restaurantId) => (\n                                                     <option key={restaurantId} value={restaurantId}>{restaurants[restaurantId].name} ({restaurantId})</option>\n                                                 ))\n                                          ) : (<option value=\"\" disabled>No hay restaurantes disponibles.</option>)}\n                                     </select>\n                                      {restaurantsLoading && <p className=\"mt-2 text-sm text-gray-500\">Cargando restaurantes...</p>}\n                      {restaurantsError && <p className=\"mt-2 text-sm text-red-500\">{restaurantsError}</p>}\n                      {!restaurantsLoading && !restaurantsError && Object.keys(restaurants).length === 0 && <p className=\"mt-2 text-sm text-gray-500\">Crea un restaurante primero.</p>}\n\n                                 </div>\n                             )}\n                              {/* Si es admin de restaurante con un solo restaurantId, mostrar la sucursal asignada */}\n                             {adminProfile.role === 'admin' && adminProfile.restaurantId && !adminProfile.managedRestaurants && (
                                  <p className=\"text-sm text-gray-700 dark:text-gray-300\">Asignando a sucursal: <strong>{restaurants[adminProfile.restaurantId]?.name || adminProfile.restaurantId}</strong></p>
                             )}\n                               {/* Si es personal de restaurante, mostrar su sucursal asignada */}
                             {adminProfile.role === 'restaurante' && adminProfile.restaurantId && (
                                  <p className=\"text-sm text-gray-700 dark:text-gray-300\">Asignando a sucursal: <strong>{restaurants[adminProfile.restaurantId]?.name || adminProfile.restaurantId}</strong></p>
                             )}\n\n\n                             <button\n                                 onClick={handleCreateRestaurantUser}\n                                 disabled={userCreationLoading || (adminProfile.role === 'admin' && !adminProfile.restaurantId && !selectedRestaurantId)} // Deshabilitar si carga o si es superadmin y no ha seleccionado restaurante\n                                 className=\"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50\"\n                             >\n                                {userCreationLoading ? \'Creando Usuario...\' : \'Crear Usuario de Restaurante\'}\n                             </button>\n                          </div>\n                      )}


                      {/* Lista de Usuarios Existentes - Muestra solo los relevantes */}
                      <div>
                          <h4 className=\"text-lg font-medium text-gray-800 dark:text-white mb-4\">Usuarios Existentes {adminProfile && adminProfile.role === 'restaurante' && adminProfile.restaurantId && restaurants[adminProfile.restaurantId] && `(${restaurants[adminProfile.restaurantId].name})`}</h4>
                          {usersLoading ? (<p className=\"text-gray-600 dark:text-gray-400\">Cargando usuarios...</p>)\n                          : usersError ? (<p className=\"text-red-500 dark:text-red-300\">{usersError}</p>)\n                          : Object.keys(users).length > 0 ? (\n                              <ul className=\"space-y-2 text-sm text-gray-800 dark:text-gray-300\">
                                  {Object.keys(users).map(uid => (
                                      // Solo mostrar usuarios con rol 'restaurante' o 'admin' (o los roles que maneja este dashboard)
                                      // Y si es admin de restaurante, solo
