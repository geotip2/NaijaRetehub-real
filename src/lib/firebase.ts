import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBh_oNH6bXqDE4yQXgF6IHPcsSLWzC1Jw4",
  authDomain: "tribal-jetty-j3bk6.firebaseapp.com",
  projectId: "tribal-jetty-j3bk6",
  storageBucket: "tribal-jetty-j3bk6.firebasestorage.app",
  messagingSenderId: "229803341308",
  appId: "1:229803341308:web:ec9b9d269d3ae76f45ee79"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
