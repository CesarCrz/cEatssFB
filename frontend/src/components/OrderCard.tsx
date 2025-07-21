import React from 'react';
import { type Order } from '../types/order'; // Importamos la interfaz Order

interface OrderCardProps {
  order: Order; // Recibimos un objeto de tipo Order como prop
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  // TODO: Implementar lógica para formatear tiempo, etc.

  return (
    // Estilos de tarjeta de pedido similares a la captura de pantalla
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 flex flex-col space-y-2">
      {/* Fila superior: Nombre y Estado/Tiempo */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-gray-900 dark:text-white">{order.customerDetails?.name || 'Cliente sin nombre'}</div>
        {/* Placeholder para Estado/Tiempo (adaptar según el estado real en la columna) */}
        {/* En PendingOrdersPage, esto podría no mostrar un tiempo aún, o un "Nuevo" */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
           {/* Este es un placeholder, la lógica real dependerá del estado del pedido */}
           {/* Por ejemplo, en "En preparación" mostrar el tiempo transcurrido o estimado */}
           {order.status === 'pendiente' ? 'Nuevo' : 'Tiempo'}
        </div>
      </div>

      {/* Fila intermedia: ID y Cantidad de Artículos */}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        ID: {order.orderId} - {order.productDetails?.length || 0} artículos
      </div>

      {/* Detalles de los productos (simplificado por ahora) */}
      {/* TODO: Iterar sobre order.productDetails para mostrar la lista de productos */}
      {/* <div className="text-sm text-gray-700 dark:text-gray-300">
           {order.productDetails.map(item => (
               <div key={item.productId || item.name}>{item.quantity}x {item.name}</div>
           ))
       </div> */} {/* Corregido el comentario */} 

      {/* Información adicional (specs, método de pago, etc.) */}
       {order.overallSpecs && (
           <div className="text-sm text-gray-700 dark:text-gray-300 italic">
               Notas: {order.overallSpecs}
           </div>
       )}

       {/* TODO: Botones de acción (ej: Marcar como En Preparación, Imprimir) */}
       <div className="flex space-x-2 mt-2">
           {/* Placeholder para botones */}
           {order.status === 'pendiente' && (
               <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                   En Preparación
               </button>
           )}
           {/* Otros botones según el estado del pedido */}
       </div>

    </div>
  );
};

export default OrderCard;
