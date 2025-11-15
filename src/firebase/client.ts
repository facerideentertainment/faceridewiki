import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from './config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Temporarily expose debug tools regardless of environment
try {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Expose a debug object to the window for debugging
    (window as any).firebaseDebug = {
        functions,
        httpsCallable
    };

} catch (error) {
    // In production, these will fail, which is expected.
    // We will revert this change after making you an admin.
    console.log("Emulator connection failed (expected in production):");
}


export { app, firestore, auth, functions };
