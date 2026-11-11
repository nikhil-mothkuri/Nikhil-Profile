/* ===================================================================
   FIREBASE INITIALIZATION & CLIENT AUTH SERVICE
   Free Tier Serverless Backend (Spark Plan: $0/month)
   Supports: Google 1-Click Auth, Email/Password Auth, Firestore DB
   =================================================================== */

// Your web app's Firebase configuration
// Replace these placeholder values with your free Firebase project settings from:
// https://console.firebase.google.com/ -> Project Settings -> General -> Your apps -> SDK setup/config
const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_API_KEY_HERE",
  authDomain: "nikhil-portfolio-ai.firebaseapp.com",
  projectId: "nikhil-portfolio-ai",
  storageBucket: "nikhil-portfolio-ai.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Designated administrator email address
const ADMIN_EMAIL = "nikhilvce@gmail.com";

// Initialize Firebase safely
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let isFirebaseConfigured = false;

try {
  if (typeof firebase !== "undefined" && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
    // Enable offline persistence for instantaneous local loads
    firestoreDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
        console.warn("Firestore persistence warning:", err);
      }
    });
    isFirebaseConfigured = true;
    console.log("✓ Firebase initialized in live cloud mode");
  } else {
    console.info("ℹ Firebase using demo/local mode. Enter your free Firebase credentials in js/firebase-config.js to activate live cloud syncing.");
  }
} catch (e) {
  console.warn("Firebase initialization skipped/failed:", e);
}

// Global Auth & DB helper API
window.firebaseService = {
  isConfigured: () => isFirebaseConfigured,
  getAuth: () => firebaseAuth,
  getDb: () => firestoreDb,
  adminEmail: ADMIN_EMAIL,

  // Check if given user is the designated admin
  isAdmin: (user) => {
    if (!user) return false;
    return user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  },

  // Get current logged-in user
  getCurrentUser: () => {
    return firebaseAuth ? firebaseAuth.currentUser : null;
  },

  // Auth State Listener
  onAuthStateChanged: (callback) => {
    if (firebaseAuth) {
      return firebaseAuth.onAuthStateChanged(callback);
    } else {
      // Simulate unauthenticated state in demo/local mode
      callback(null);
      return () => {};
    }
  },

  // 1-Click Google Sign-In
  signInWithGoogle: async () => {
    if (!firebaseAuth) {
      throw new Error("Firebase is not configured yet. Please configure your free project keys in js/firebase-config.js.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return await firebaseAuth.signInWithPopup(provider);
  },

  // Email & Password Sign-In
  signInWithEmail: async (email, password) => {
    if (!firebaseAuth) {
      throw new Error("Firebase is not configured yet. Please configure your free project keys in js/firebase-config.js.");
    }
    return await firebaseAuth.signInWithEmailAndPassword(email, password);
  },

  // Email & Password Registration (for readers to comment)
  signUpWithEmail: async (email, password, displayName) => {
    if (!firebaseAuth) {
      throw new Error("Firebase is not configured yet. Please configure your free project keys in js/firebase-config.js.");
    }
    const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    if (displayName && cred.user) {
      await cred.user.updateProfile({ displayName: displayName });
    }
    return cred;
  },

  // Password Reset Email
  sendPasswordReset: async (email) => {
    if (!firebaseAuth) throw new Error("Firebase is not configured yet.");
    return await firebaseAuth.sendPasswordResetEmail(email);
  },

  // Sign Out
  signOut: async () => {
    if (firebaseAuth) {
      return await firebaseAuth.signOut();
    }
  }
};
