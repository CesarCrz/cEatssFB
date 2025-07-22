// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  // Mantener databaseURL si la usas para producción, si no, puedes depender solo de la conexión al emulador en desarrollo
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Auth and Database service
const auth = getAuth(app);
const database = getDatabase(app);

// Connect to the emulators if running locally or in an environment with emulator variables
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST && import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_HOST) {
  console.log("Connecting to Firebase emulators using environment variables...");

  const authEmulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
  const authEmulatorPort = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT ? parseInt(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT) : 9099; // Puerto por defecto si no está en .env

  const dbEmulatorHost = import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_HOST;
  const dbEmulatorPort = import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT ? parseInt(import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT) : 8087; // Puerto por defecto si no está en .env

  try {
      console.log(`Attempting to connect Auth emulator to ${authEmulatorHost}:${authEmulatorPort}`);
      // Usar host y puerto de las variables de entorno
      // Determinar el protocolo (http o https) basado en el puerto o si el host es localhost
      const authProtocol = authEmulatorPort === 443 || (!authEmulatorHost.startsWith('localhost') && !authEmulatorHost.startsWith('127.0.0.1')) ? 'https' : 'http';
       connectAuthEmulator(auth, `${authProtocol}://${authEmulatorHost}:${authEmulatorPort}`);

      console.log(`Attempting to connect Database emulator to ${dbEmulatorHost}:${dbEmulatorPort}`);
      // connectDatabaseEmulator espera host (string) y port (number)
      connectDatabaseEmulator(database, dbEmulatorHost, dbEmulatorPort);

      console.log("Firebase emulators connection configured using environment variables.");
  } catch (error) {
      console.error("Failed to connect to Firebase emulators using environment variables:", error);
  }
} else if (window.location.hostname === "localhost" || import.meta.env.DEV) {
   // Fallback a conexión localhost si no se definen las variables de entorno del emulador
    console.log("Connecting to Firebase emulators using localhost fallback...");
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
        connectDatabaseEmulator(database, "127.0.0.1", 8087);
        console.log("Firebase emulators connection configured using localhost.");
    } catch (error) {
         console.error("Failed to connect to Firebase emulators using localhost fallback:", error);
    }
}


export { auth, database };