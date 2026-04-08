import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZdsQxpHyQ--qCK7q6YyFMavWldS02iFY",
  authDomain: "noteflow-mark03.firebaseapp.com",
  projectId: "noteflow-mark03",
  storageBucket: "noteflow-mark03.appspot.com",
  messagingSenderId: "703082447416",
  appId: "1:703082447416:web:4119cba69fe64c9e685ccd",
  measurementId: "G-KH8GEJFKGZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
