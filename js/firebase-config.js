/**
 * CGAPH - Firebase Configuration and Initialization
 * Connects to Firebase Authentication, Cloud Firestore, and Cloud Storage.
 * Supports live Firebase SDK and fallback offline-resilient local sync.
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Default configuration placeholder - user can update with their console keys
export const firebaseConfig = {
  apiKey: "AIzaSyDemoDummyKey-ReplaceWithYourActualFirebaseApiKey",
  authDomain: "cgaph-ecommerce.firebaseapp.com",
  projectId: "cgaph-ecommerce",
  storageBucket: "cgaph-ecommerce.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Check if credentials have been replaced with real project credentials
export const isConfigured = Boolean(
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes("DemoDummyKey") &&
  firebaseConfig.projectId !== "cgaph-ecommerce"
);

let app = null;
let auth = null;
let db = null;
const googleProvider = new GoogleAuthProvider();

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialized in development mode:", error.message);
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
};
