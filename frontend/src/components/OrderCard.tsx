import React from 'react';
import { type Order, type ProductDetails } from '../types/order'; // Importamos también ProductDetails con type

interface OrderCardProps {
  order: Order; // Recibimos un objeto de tipo Order como prop
  // TODO: Añadir props para manejar acciones de botón (ej: onMarkAsPreparing)
  // También pasar el ID del restaurante para las acciones que lo requieran
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  // TODO: Implementar lógica para formatear tiempo, etc.
  // Para mostrar el tiempo transcurrido desde que el pedido está "En preparación" o "Listo"

  // Verificar si order.productDetails es un array válido antes de mapear
  const productDetails = Array.isArray(order.productDetails) ? order.productDetails : [];

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 flex flex-col space-y-3"> {/* Ajustado space-y */}
      {/* Fila superior: Nombre y Estado/Tiempo */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-gray-900 dark:text-white text-lg">{order.customerDetails?.name || 'Cliente sin nombre'}</div> {/* Tamaño de fuente ajustado */}
        {/* Placeholder para Estado/Tiempo */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
           {/* Este es un placeholder, la lógica real dependerá del estado del pedido */}
           {/* En "En preparación" o "Listo", mostrar el tiempo. En "Pendiente", mostrar "Nuevo" */}
           {order.status === 'pendiente' ? (
             <span className="text-blue-600 dark:text-blue-400 font-medium">Nuevo</span>
           ) : order.status === 'en preparacion' ? (
             // TODO: Calcular y mostrar tiempo transcurrido
             <span className="text-yellow-600 dark:text-yellow-400">En prep. (Tiempo)</span>
           ) : order.status === 'listo' ? (
             // TODO: Calcular y mostrar tiempo listo
             <span className="text-green-600 dark:text-green-400">Listo (Tiempo)</span>
           ) : (
              <span className="text-gray-600 dark:text-gray-400">{order.status}</span> // Mostrar otro estado si es necesario
           )}
        </div>
      </div>

      {/* Fila intermedia: ID y Tipo de Entrega/Número */}
       <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
         <span>ID: {order.orderId}</span>
          {order.deliverOrRest === 'domicilio' ? (
             <span> A Domicilio</span> // TODO: Usar icono real
          ) : (
             <span> Para Recoger</span> // TODO: Usar icono real
          )}
       </div>

      {/* Detalles de los productos */}
      {productDetails.length > 0 && ( // Mostrar sección solo si hay productos
        <div>
             <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Artículos:</div>
             <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-0.5"> {/* Estilo de lista */}
                 {productDetails.map((item: ProductDetails, index: number) => (
                     // Usar index como key si no hay un ID único estable por item en el pedido JSON
                     // Mejorar el acceso seguro a propiedades anidadas
                     <li key={index}>{item.quantity}x {item.name} - ${item.total != null ? item.total.toFixed(2) : 'N/A'} {item.currency || ''}</li>
                 ))}
             </ul>
         </div>
      )}


      {/* Información adicional (specs, método de pago, Total) */}
       {order.overallSpecs && (
           <div className="text-sm text-gray-700 dark:text-gray-300 italic border-t border-gray-200 dark:border-gray-600 pt-3"> {/* Separador superior */}
               Notas: {order.overallSpecs}
           </div>
       )}

       <div className="flex justify-between items-center text-sm font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-3"> {/* Separador superior para Total */}
          <span>Método de Pago: {order.payMethod || 'No especificado'}</span> {/* Manejar posible valor nulo */}
          <span>Total: ${order.total != null ? order.total.toFixed(2) : 'N/A'} {order.currency || ''}</span> {/* Manejar posible valor nulo */}
       </div>


       {/* TODO: Botones de acción */}
       <div className="flex space-x-2 mt-2 border-t border-gray-200 dark:border-gray-600 pt-3"> {/* Separador superior para botones */}
           {/* Placeholder para botones de acción */}
           {order.status === 'pendiente' && (
               <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-md"> {/* Botón más ancho */}
                   Marcar En Preparación
               </button>
           )}
           {order.status === 'en preparacion' && (
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded-md">
                   Marcar Listo
               </button>
           )}
           {order.status === 'listo' && (
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-md">
                   Marcar Entregado
               </button>
           )}
            {/* Botón Cancelar siempre visible? O condicional? */}
            {order.status !== 'cancelado' && order.status !== 'entregado' && (
                 <button className="flex-none bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-md"> {/* Botón de acción secundaria/negativa */}
                   Cancelar
               </button>
            )}
           {/* Otros botones como Imprimir, Ver Detalles Completos, etc. */}
       </div>

    </div>
  );
};

export default OrderCard;
