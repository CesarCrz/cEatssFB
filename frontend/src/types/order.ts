// Definición de la interfaz para los detalles del producto dentro de un pedido
interface ProductDetails {
  productId?: string; // Opcional: referencia al producto original
  name: string;
  quantity: number;
  price: number; // Precio unitario al momento del pedido
  total: number; // Precio total por este item
  currency: string;
  specs?: string; // Especificaciones adicionales del item (opcional)
}

// Definición de la interfaz para los detalles del cliente dentro de un pedido (desnormalizado)
interface CustomerDetails {
  name: string;
  phoneNumber?: string; // Opcional
  deliverTo?: string; // Para recoger (opcional)
  address?: string; // Para domicilio (opcional)
}

// Definición de la interfaz principal para un pedido
export interface Order {
  action?: string; // Campo 'action' del JSON original (opcional en la BD)
  orderId: string; // ID único del pedido
  orderToken?: string; // Token del pedido (opcional)
  deliverOrRest: 'domicilio' | 'recoger'; // Tipo de entrega
  customerId?: string; // Referencia al cliente que realizó el pedido (opcional si no hay auth de cliente)
  restaurantId: string; // Referencia al restaurante
  customerDetails: CustomerDetails; // Detalles del cliente (desnormalizado)
  productDetails: ProductDetails[]; // Array de detalles de productos
  subtotal: number; // Suma de los totales de los items
  deliveryFee?: number; // Costo de envío (opcional)
  total: number; // Total del pedido
  currency: string;
  overallSpecs?: string; // Instrucciones generales del pedido (opcional)
  payMethod: string; // Método de pago
  status: 'pendiente' | 'en preparacion' | 'listo' | 'entregado' | 'cancelado'; // Estado del pedido
  timestamp: number; // Marca de tiempo de creación del pedido
  preparationTime?: number; // Tiempo estimado de preparación en minutos (opcional, añadido por el restaurante)
  pickedUpBy?: string; // Nombre de quien recoge (opcional)
  archived?: boolean; // Para archivar pedidos completados (opcional)
}
