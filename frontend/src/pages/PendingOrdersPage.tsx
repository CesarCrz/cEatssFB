import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, query, orderByChild, equalTo, onValue, DataSnapshot } from 'firebase/database';

import { database } from '../firebase-config';
import { type Order } from '../types/order';
import OrderCard from '../components/OrderCard'; // Importamos el componente OrderCard

const PendingOrdersPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar notificación sonora y visual para nuevos pedidos

  useEffect(() => {
    if (!restaurantId) {
      setError("ID del restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const ordersRef = ref(database, `restaurants/${restaurantId}/orders`);

    const pendingOrdersQuery = query(
      ordersRef,
      orderByChild('status'),
      equalTo('pendiente')
    );

    const unsubscribe = onValue(pendingOrdersQuery, (snapshot: DataSnapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((childSnapshot) => {
        const order = childSnapshot.val() as Order;
        // Aquí podrías añadir lógica para detectar NUEVOS pedidos y activar notificación
        orders.push(order);
      });
      // Mantener un orden consistente, por ejemplo, por marca de tiempo (los más nuevos primero)
      orders.sort((a, b) => b.timestamp - a.timestamp);
      setPendingOrders(orders);
      setLoading(false);
    }, (error) => {
      console.error("Error al leer pedidos pendientes:", error);
      setError("No se pudieron cargar los pedidos pendientes.");
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [restaurantId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900"> { /* Contenedor principal con flex */}
      {/* Barra Lateral (Placeholder) */}
      <div className="w-16 bg-gray-800 dark:bg-gray-950 text-white flex flex-col items-center py-6"> { /* Ancho fijo para la barra lateral */}
        {/* Iconos de navegación irían aquí (placeholder) */}
        <div className="mb-8">Icono 1</div>
        <div className="mb-8">Icono 2</div>
        {/* ... más iconos */}
      </div>

      {/* Área de Contenido Principal */}
      <div className="flex-1 p-6"> { /* Flex-1 para ocupar el espacio restante */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pedidos</h1>

        {/* Contenedor de Columnas de Estado */}
        <div className="flex space-x-6 overflow-x-auto pb-4"> { /* Añadido overflow para scroll si hay muchas columnas */}

          {/* Columna de Pedidos Pendientes */}
          <div className="w-80 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg p-4"> { /* Ancho fijo para la columna, fondo y padding */}
            <div className="flex justify-between items-center mb-4"> { /* Flex para alinear título y contador */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pendientes</h3> { /* Estilo del título de columna */}
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingOrders.length}</span> { /* Contador de pedidos */}
            </div>

            {/* Lista de Pedidos Pendientes */}
            <div className="space-y-4"> { /* Espacio entre las tarjetas de pedido */}
              {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => (
                  // Usamos el componente OrderCard aquí y le pasamos el objeto order
                  <OrderCard key={order.orderId} order={order} />
                ))
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">No hay pedidos pendientes.</div>
              )}
            </div>
          </div>

          {/* TODO: Columnas para "En Preparación" y "Listos" irían aquí */}

        </div>
      </div>
    </div>
  );
};

export default PendingOrdersPage;
