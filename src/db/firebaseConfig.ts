import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

const {
  REACT_APP_FIREBASE_API_KEY = "",
  REACT_APP_FIREBASE_AUTH_DOMAIN = "",
  REACT_APP_FIREBASE_PROJECT_ID = "",
  REACT_APP_FIREBASE_STORAGE_BUCKET = "",
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID = "",
  REACT_APP_FIREBASE_APP_ID = "",
  REACT_APP_FIREBASE_MEASUREMENT_ID = "",
} = process.env;

// Interface para configuração do Firebase
interface Config {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Configuração Firebase
const firebaseConfig: Config = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
  measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Inicializa o Firebase Auth (sem persistência específica para web)
export const authInstance = getAuth(app);

// Inicializa Firestore e Storage
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Exporta funções relacionadas ao Firestore e Storage
export {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDownloadURL,
  ref,
  setDoc,
  updateDoc,
  uploadBytes
};
