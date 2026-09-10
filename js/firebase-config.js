/**
 * CGAPH - Firebase Configuration and Initialization
 * Connects to Firebase Authentication, Cloud Firestore, and Cloud Storage using Firebase SDK 12.18.0.
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA_BHHxKOXSlswVHCVHZkX_QlcY2Vz2d5Q",
  authDomain: "shayan-gay.firebaseapp.com",
  projectId: "shayan-gay",
  storageBucket: "shayan-gay.firebasestorage.app",
  messagingSenderId: "503552166039",
  appId: "1:503552166039:web:d64cbacbb0a0364b8d81d2"
};

// Check if credentials are configured
export const isConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId === "shayan-gay"
);

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
const googleProvider = new GoogleAuthProvider();

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase 12.18.0 initialized with project:", firebaseConfig.projectId);
} catch (error) {
  console.warn("Firebase initialization warning:", error.message);
}

// Global reference for console debugging
if (typeof window !== 'undefined') {
  window.__FIREBASE_APP__ = app;
  window.__FIREBASE_AUTH__ = auth;
  window.__FIREBASE_DB__ = db;
}

export { 
  app, 
  auth, 
  db, 
  storage,
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
  serverTimestamp,
  storageRef,
  uploadBytes,
  getDownloadURL
};
