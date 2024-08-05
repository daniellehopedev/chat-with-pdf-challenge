import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrh-y65pDINbF08gnYFc4LezOmOGqsjV8",
  authDomain: "chat-with-pdf-challenge-4ac0f.firebaseapp.com",
  projectId: "chat-with-pdf-challenge-4ac0f",
  storageBucket: "chat-with-pdf-challenge-4ac0f.appspot.com",
  messagingSenderId: "829362993748",
  appId: "1:829362993748:web:fe3dbea87be4e283908bc1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
