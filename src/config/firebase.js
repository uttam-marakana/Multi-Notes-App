import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const requiredFirebaseEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check required Firebase environment variables
const missingFirebaseEnv = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value || value.trim() === "")
  .map(([key]) => key);

if (missingFirebaseEnv.length > 0) {
  throw new Error(
    `Missing Firebase configuration. Set these variables in .env: ${missingFirebaseEnv.join(
      ", "
    )}`
  );
}

const firebaseConfig = {
  apiKey: requiredFirebaseEnv.VITE_FIREBASE_API_KEY,
  authDomain: requiredFirebaseEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredFirebaseEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredFirebaseEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    requiredFirebaseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredFirebaseEnv.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Firebase Storage
export const storage = getStorage(app);

// Firebase Analytics
export const analytics =
  typeof window !== "undefined" && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

// Export Firebase App instance
export default app;