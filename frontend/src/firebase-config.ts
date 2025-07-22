// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Auth and Database service
const auth = getAuth(app);
const database = getDatabase(app);

// --- Lógica para conectar a emuladores (MODIFICADA) ---
// Conectar a los emuladores solo si la variable de entorno VITE_USE_EMULATORS está establecida a 'true'
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  console.log("Connecting to Firebase emulators based on VITE_USE_EMULATORS environment variable...");
  try {
      // Puedes usar los valores por defecto si no necesitas configurarlos en variables separadas,
      // o seguir usando las variables VITE_FIREBASE_*_EMULATOR_HOST/PORT si prefieres flexibilidad.
      // Para simplificar ahora, usaremos los valores por defecto.
      connectAuthEmulator(auth, "http://127.0.0.1:9099");
      connectDatabaseEmulator(database, "127.0.0.1", 8087);

      console.log("Firebase emulators connection configured.");
  } catch (error) {
      console.error("Failed to connect to Firebase emulators:", error);
  }
} else {
    console.log("Connecting to cloud Firebase.");
}
// --- Fin de la lógica de emuladores ---


export { auth, database };