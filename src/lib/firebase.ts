import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDPYCsqWqMxzkQp0V57pXwurwNhBLfWm6w",
  authDomain: "solosaas-905f9.firebaseapp.com",
  projectId: "solosaas-905f9",
  storageBucket: "solosaas-905f9.firebasestorage.app",
  messagingSenderId: "778157356122",
  appId: "1:778157356122:web:3aa207448b4d765b49d463",
  measurementId: "G-4CY6C7N20D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only supported in browser environments
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, db, analytics };
