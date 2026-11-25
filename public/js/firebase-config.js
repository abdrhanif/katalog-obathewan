/**
 * Firebase SDK Integration for 'katalog-obathewan'
 * Follows Firebase Agent Skills architecture.
 * Supports auto-initialization from Firebase Hosting environment (/__/firebase/init.js)
 * and direct SDK configuration fallback.
 */

// Firebase Configuration for project 'katalog-obathewan'
export const firebaseConfig = {
  projectId: "katalog-obathewan",
  appId: "1:148335504884:web:5768719e0c46730b665da1",
  storageBucket: "katalog-obathewan.firebasestorage.app",
  apiKey: "AIzaSyBZMeq-YNNyvBPdK5wXc0Ma9W49rYWqyzw",
  authDomain: "katalog-obathewan.firebaseapp.com",
  messagingSenderId: "148335504884",
  measurementId: "G-6ZSQHE59JS",
  projectNumber: "148335504884"
};

let app = null;
let firestore = null;
let auth = null;

export async function initializeFirebaseApp() {
  try {
    // If running in browser and Firebase CDN is available
    if (window.firebase && typeof window.firebase.initializeApp === "function") {
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        app = window.firebase.initializeApp(firebaseConfig);
      } else {
        app = window.firebase.app();
      }
      console.log("Firebase App initialized successfully for project:", firebaseConfig.projectId);
      if (window.firebase.firestore) {
        firestore = window.firebase.firestore();
      }
      if (window.firebase.auth) {
        auth = window.firebase.auth();
      }
      return { app, firestore, auth, isConnected: true };
    }
  } catch (error) {
    console.warn("Firebase auto-init notice:", error.message);
  }

  return {
    app: null,
    firestore: null,
    auth: null,
    isConnected: false,
    config: firebaseConfig
  };
}

export function getFirebaseConfig() {
  return firebaseConfig;
}
