
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from './config';


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, firestore, functions, storage, analytics };
