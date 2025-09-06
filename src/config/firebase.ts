import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDUR5HNTb4oB-1VmMeBAiYTJjU7EZoXbmg",
  authDomain: "trm-x-masters.firebaseapp.com",
  projectId: "trm-x-masters",
  storageBucket: "trm-x-masters.firebasestorage.app",
  messagingSenderId: "404050466584",
  appId: "1:404050466584:web:42c06fa92db95f1542b06d",
  measurementId: "G-XZQMK30N9B",
  databaseURL: "https://trm-x-masters-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;
