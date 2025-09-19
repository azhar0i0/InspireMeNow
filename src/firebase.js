// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRdd6f_vTKt7MDn1ZCFBvNJYYCXgVuLio",
  authDomain: "inspire-me-now-f84c3.firebaseapp.com",
  projectId: "inspire-me-now-f84c3",
  storageBucket: "inspire-me-now-f84c3.firebasestorage.app", 
  messagingSenderId: "760983646847",
  appId: "1:760983646847:web:a853485e0e16adb0c9c54a",
  measurementId: "G-0P612LP6ZM",
};

// ✅ Prevent duplicate app initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
