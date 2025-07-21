import * as admin from 'firebase-admin';

// Importa el archivo JSON de tu Service Account.
// Asegúrate de que la ruta sea correcta relativa a donde se ejecuta el script de Node.js
// y que este archivo NO esté en tu repositorio Git.
const serviceAccount = require('../config/caesars-eats-firebase-adminsdk-fbsvc-c45636f2ca.json'); // Reemplaza 'serviceAccountKey.json' con el nombre de tu archivo

// Inicializa Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://caesars-eats-default-rtdb.firebaseio.com/' // Reemplaza con la URL de tu Realtime Database
  });
}

// Obtén una referencia a la instancia de Realtime Database
const db = admin.database();

export { db, admin }; // Exporta la instancia de la base de datos y el objeto admin