import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { firebaseConfig } from './config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

if (process.env.NODE_ENV === 'development') {
    try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (error) {
        console.error("Error connecting to emulators:", error);
    }
}

export { app, firestore, auth, functions };
