import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

// Importa la instancia de la base de datos de Firebase Admin
import { db } from './firebaseAdmin';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Backend de Caesar´s Eats funcionando!');
});

// --- Ruta POST para recibir pedidos ---
app.post('/api/pedidos', async (req: Request, res: Response) => {
  const orderData = req.body;

  console.log('Pedido recibido:', JSON.stringify(orderData, null, 2));

  if (!orderData || !orderData.orderId || !orderData.sucursal || !orderData.productDetails || !orderData.total) {
    return res.status(400).json({ success: false, message: 'Datos del pedido incompletos.' });
  }

  try {
    const sucursalName = orderData.sucursal;
    let restaurantId: string | null = null;

    // TODO: Implementar un mapeo seguro y escalable de sucursalName a restaurantId.
    // Asumimos que sucursalName es el restaurantId por ahora.
    restaurantId = sucursalName;

    if (!restaurantId) {
        console.error(`Restaurant ID no encontrado para la sucursal: ${sucursalName}`);
        return res.status(400).json({ success: false, message: `Sucursal "${sucursalName}" no encontrada.` });
    }

    const timestamp = Date.now();
    const initialStatus = 'pendiente';

    const orderToSave = {
      ...orderData,
      restaurantId: restaurantId,
      status: initialStatus,
      timestamp: timestamp,
      productDetails: typeof orderData.productDetails === 'string' ? JSON.parse(orderData.productDetails) : orderData.productDetails,
      archived: false
    };

    // Usar db.ref() y .set() del SDK de Firebase Admin
    const orderRef = db.ref(`restaurants/${restaurantId}/orders/${orderData.orderId}`);
    await orderRef.set(orderToSave);

    console.log(`Pedido ${orderData.orderId} guardado exitosamente para el restaurante ${restaurantId}.`);

    res.status(200).json({ success: true, message: 'Pedido recibido y guardado correctamente.', orderId: orderData.orderId });

  } catch (error: any) {
    console.error('Error al procesar o guardar el pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar el pedido.', error: error.message });
  }
});
// --- Fin de la Ruta POST para recibir pedidos ---

app.listen(port, () => {
  console.log(`Servidor backend escuchando en el puerto ${port}`);
});