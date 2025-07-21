// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database"; // Asegúrate de importar connectDatabaseEmulator

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
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL // Agregamos la URL de la base de datos
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Auth and Database service
const auth = getAuth(app);
const database = getDatabase(app);

// Connect to the emulators if running locally
if (window.location.hostname === "localhost" || import.meta.env.DEV) {
  console.log("Connecting to Firebase emulators...");
  // Utiliza los puertos que configuramos en firebase.json
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  // CORRECCIÓN: Separar host y port para connectDatabaseEmulator
  connectDatabaseEmulator(database, "127.0.0.1", 8087);
  // connectFirestoreEmulator(db, "http://127.0.0.1:8080"); // Si usas Firestore, descomenta esta línea
  // connectFunctionsEmulator(functions, "http://127.0.0.1:5001"); // Si usas Functions, descomenta esta línea
}

export { auth, database };
