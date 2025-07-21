import express, { Request, Response } from 'express'; // Importamos Request y Response types
import bodyParser from 'body-parser';
import { ref, set, push, get } from 'firebase/database'; // Importamos ref, set, push, y get de firebase/database (para admin sdk)

// Importa la instancia de la base de datos de Firebase Admin
import { db } from './firebaseAdmin';

const app = express();
const port = process.env.PORT || 3000; // Puerto donde escuchará el servidor

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(bodyParser.json());

// Middleware básico para loggear solicitudes (opcional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.send('Backend de Caesar´s Eats funcionando!');
});

// --- Ruta POST para recibir pedidos ---
app.post('/api/pedidos', async (req: Request, res: Response) => {
  const orderData = req.body; // Los datos del pedido enviados en el cuerpo de la solicitud

  console.log('Pedido recibido:', JSON.stringify(orderData, null, 2));

  // Validar datos básicos del pedido
  if (!orderData || !orderData.orderId || !orderData.sucursal || !orderData.productDetails || !orderData.total) {
    return res.status(400).json({ success: false, message: 'Datos del pedido incompletos.' });
  }

  try {
    const sucursalName = orderData.sucursal;
    let restaurantId: string | null = null;

    // TODO: Implementar un mapeo seguro y escalable de sucursalName a restaurantId.
    // Por ahora, un mapeo simple o asumir que sucursalName es el restaurantId.
    // En un sistema real, leerías tus restaurantes de la BD y harías el mapeo.

    // Ejemplo de mapeo simple (asumiendo que sucursalName es el ID):
    restaurantId = sucursalName; // <<<--- ASUMIMOS QUE EL NOMBRE DE SUCURSAL ES EL restaurantId

    // Si necesitas buscar el ID basado en el nombre de sucursal:
    // const restaurantsRef = ref(db, 'restaurants');
    // const snapshot = await get(restaurantsRef);
    // if (snapshot.exists()) {
    //   const restaurants = snapshot.val();
    //   for (const id in restaurants) {
    //     if (restaurants[id].name === sucursalName) { // Asumiendo que 'name' es el campo del nombre
    //       restaurantId = id;
    //       break;
    //     }
    //   }
    // }

    if (!restaurantId) {
        console.error(`Restaurant ID no encontrado para la sucursal: ${sucursalName}`);
        return res.status(400).json({ success: false, message: `Sucursal "${sucursalName}" no encontrada.` });
    }


    // Enriquecer los datos del pedido antes de guardar
    const timestamp = Date.now(); // Marca de tiempo actual
    const initialStatus = 'pendiente'; // Estado inicial del pedido

    const orderToSave = {
      ...orderData, // Copiar todos los datos recibidos
      restaurantId: restaurantId, // Añadir el ID del restaurante
      status: initialStatus, // Añadir el estado inicial
      timestamp: timestamp, // Añadir la marca de tiempo
      // Asegurarse de que productDetails esté en el formato correcto (no como string JSON)
      productDetails: typeof orderData.productDetails === 'string' ? JSON.parse(orderData.productDetails) : orderData.productDetails,
       // Añadir campos adicionales si son relevantes para la BD y no vienen en el JSON:
       archived: false // Campo para archivar pedidos en el frontend
    };

    // Referencia a la ubicación donde guardar el pedido en Realtime Database
    const orderRef = ref(db, `restaurants/${restaurantId}/orders/${orderData.orderId}`);

    // Guardar el pedido en la base de datos
    await set(orderRef, orderToSave);

    console.log(`Pedido ${orderData.orderId} guardado exitosamente para el restaurante ${restaurantId}.`);

    // Responder al sistema externo
    res.status(200).json({ success: true, message: 'Pedido recibido y guardado correctamente.', orderId: orderData.orderId });

  } catch (error: any) {
    console.error('Error al procesar o guardar el pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar el pedido.', error: error.message });
  }
});
// --- Fin de la Ruta POST para recibir pedidos ---


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en el puerto ${port}`);
});
