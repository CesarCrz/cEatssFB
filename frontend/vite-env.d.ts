/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_DATABASE_URL: string; // Puedes mantener esta, o ya no usarla si conectas a emulador por host/port

  // Nuevas variables de entorno para los emuladores
  readonly VITE_FIREBASE_AUTH_EMULATOR_HOST?: string; // Opcional si no siempre se usan emuladores
  readonly VITE_FIREBASE_AUTH_EMULATOR_PORT?: string; // Opcional
  readonly VITE_FIREBASE_DATABASE_EMULATOR_HOST?: string; // Opcional
  readonly VITE_FIREBASE_DATABASE_EMULATOR_PORT?: string; // Opcional
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
