import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the auth and firestore services
const auth = getAuth(app);
const db = getFirestore(app);

// --- MODIFIED: This is the crucial change ---
// If the app is running on localhost, connect to the local emulators
if (window.location.hostname === "localhost") {
  console.log("Connecting to local Firebase emulators...");
  // Point the Auth library to the local Auth emulator
  connectAuthEmulator(auth, "http://localhost:9099");
  // Point the Firestore library to the local Firestore emulator
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { auth, db };
