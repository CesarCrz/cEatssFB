import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { db, admin } from './firebaseAdmin';

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

app.post('/api/pedidos', async (req: Request, res: Response) => {
  const orderData = req.body;

  console.log('Pedido recibido:', JSON.stringify(orderData, null, 2));

  if (!orderData || !orderData.orderId || !orderData.sucursal || !orderData.productDetails || !orderData.total) {
    return res.status(400).json({ success: false, message: 'Datos del pedido incompletos.' });
  }

  try {
    const sucursalName = orderData.sucursal;
    let restaurantId: string | null = null;

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

    const orderRef = db.ref(`restaurants/${restaurantId}/orders/${orderData.orderId}`);
    await orderRef.set(orderToSave);

    console.log(`Pedido ${orderData.orderId} guardado exitosamente para el restaurante ${restaurantId}.`);

    res.status(200).json({ success: true, message: 'Pedido recibido y guardado correctamente.', orderId: orderData.orderId });

  } catch (error: any) {
    console.error('Error al procesar o guardar el pedido:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar el pedido.', error: error.message });
  }
});

app.post('/api/createRestaurantUser', async (req: Request, res: Response) => {
    console.log('Received POST request for /api/createRestaurantUser'); // Added logging
    const { email, password, restaurantId, role } = req.body; // Extraemos los datos del cuerpo

    console.log('Request to create restaurant user:', { email, restaurantId, role });

    if (!email || !password || !restaurantId || role !== 'restaurante') {
        console.log('Validation failed: Missing data or invalid role.'); // Added logging
        return res.status(400).json({ success: false, message: 'Datos de usuario de restaurante incompletos o rol inválido.' });
    }

    try {
        console.log(`Attempting to create user in Firebase Auth with email: ${email}`); // Added logging
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        const uid = userRecord.uid;
        console.log(`User created in Auth with UID: ${uid}. Attempting to save profile to DB.`); // Added logging

        const userProfileRef = db.ref(`users/${uid}`);
        await userProfileRef.set({
            email: email,
            role: role,
            restaurantId: restaurantId,
            createdAt: Date.now(),
        });
        console.log(`User profile saved in DB for UID: ${uid}. Attempting to add to staffUsers.`); // Added logging

        const staffUserRef = db.ref(`restaurants/${restaurantId}/staffUsers/${uid}`);
        await staffUserRef.set(true);
        console.log(`User ${uid} added to staffUsers for restaurant ${restaurantId}. Sending success response.`); // Added logging

        console.log(`Restaurant user ${email} (${uid}) created and assigned to ${restaurantId}.`);

        res.status(201).json({ success: true, message: 'Usuario de restaurante creado y asignado exitosamente.', uid: uid });

    } catch (error: any) {
        console.error('Error caught in /api/createRestaurantUser:', error); // Modified logging

        let errorMessage = 'Error interno al crear el usuario de restaurante.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'El correo electrónico ya está en uso.';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'El formato del correo electrónico es inválido.';
        } else if (error.code === 'auth/weak-password') {
             errorMessage = 'La contraseña es demasiado débil.';
        }

        console.log('Sending error response to frontend.'); // Added logging
        res.status(500).json({ success: false, message: errorMessage, error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en el puerto ${port}`);
});
