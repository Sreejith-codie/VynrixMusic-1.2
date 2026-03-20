import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCyjLSo10mSj4THQSuf_LRk-CBWEqCfcU",
  authDomain: "vynrix-music.firebaseapp.com",
  projectId: "vynrix-music",
  storageBucket: "vynrix-music.firebasestorage.app",
  messagingSenderId: "694017779079",
  appId: "1:694017779079:web:686ed1047c351f89d49f22",
  measurementId: "G-LJ2FFC6MF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
