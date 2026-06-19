import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYl9i5Y2kkh6u8D_LjBpObpkSNT30zpaE",
  authDomain: "molecular-dominoes-gallery.firebaseapp.com",
  projectId: "molecular-dominoes-gallery",
  storageBucket: "molecular-dominoes-gallery.firebasestorage.app",
  messagingSenderId: "1029732823519",
  appId: "1:1029732823519:web:a32cb18c60b9b03242546a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);