import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWGY7ymJ0YtHpLT_kG2Ewo1YBszvbHdZc",
  authDomain: "cartspark-85cbc.firebaseapp.com",
  projectId: "cartspark-85cbc",
  storageBucket: "cartspark-85cbc.appspot.com",
  messagingSenderId: "83021752587",
  appId: "1:83021752587:web:466dc97b5e033883219a0e",
  measurementId: "G-1SZ9CTLS0G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
