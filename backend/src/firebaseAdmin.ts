// Importa el archivo JSON de tu Service Account.
// Asegúrate de que la ruta sea correcta relativa a donde se ejecuta el script de Node.js
// y que este archivo NO esté en tu repositorio Git.
const serviceAccount = require('../config/caesars-eats-firebase-adminsdk-fbsvc-c45636f2ca.json'); // Reemplaza 'serviceAccountKey.json' con el nombre de tu archivo

console.log("Service account file loaded. Checking its structure...");
if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.project_id) {
    console.error("ERROR: Service account file seems to be missing, not an object, or missing project_id.");
    // Dependiendo de cómo quieras manejar esto, podrías lanzar un error aquí
    // throw new Error("Invalid or missing service account configuration.");
} else {
    console.log(`Service account loaded successfully for project: ${serviceAccount.project_id}`);
}

// Inicializa Firebase Admin SDK
const admin = require('firebase-admin'); // Asegúrate de importar admin

if (!admin.apps.length) {
  console.log("Initializing Firebase Admin SDK..."); // Added logging
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://caesars-eats-default-rtdb.firebaseio.com/' // Reemplaza con la URL de tu Realtime Database
  });
  console.log("Firebase Admin SDK initialized."); // Added logging
} else {
  console.log("Firebase Admin SDK already initialized."); // Added logging
}

// Exporta la instancia de la base de datos
const db = admin.database();

export { db, admin };
