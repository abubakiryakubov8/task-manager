import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCS0Y8hCCyz0CFTQHiPy_8pPUTKshljQSU",
    authDomain: "client-task-manager-88934.firebaseapp.com",
    projectId: "client-task-manager-88934",
    storageBucket: "client-task-manager-88934.firebasestorage.app",
    messagingSenderId: "489942276235",
    appId: "1:489942276235:web:3c3e46f5abbba012e7dc8e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);