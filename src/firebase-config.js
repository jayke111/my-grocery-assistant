import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, memoryLocalCache } from "firebase/firestore";

// This check is crucial. It ensures that your .env file is being read correctly.
if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  throw new Error("Firebase config is not set. Make sure you have a .env.local file with your Firebase credentials.");
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log("Firebase Config Loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    runningOnLocalhost: window.location.hostname === "localhost"
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const useEmulators = window.location.hostname === "localhost";

const db = initializeFirestore(app, {
  localCache: useEmulators ? memoryLocalCache() : persistentLocalCache()
});

// This block connects to the local emulators ONLY if you are running on localhost.
if (useEmulators) {
  console.log("Connecting to local Firebase emulators...");
  // Make sure these ports match the ports in your firebase.json file.
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
} else {
  console.log("Connecting to live Firebase services.");
}

export { auth, db };
