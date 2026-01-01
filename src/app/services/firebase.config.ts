// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArrMO9Aq1kUm-fZF8tS0I1ly1c06Eohxc",
  authDomain: "nomina-18edb.firebaseapp.com",
  projectId: "nomina-18edb",
  storageBucket: "nomina-18edb.firebasestorage.app",
  messagingSenderId: "333098657292",
  appId: "1:333098657292:web:b62966be0e3901e7e73029"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;