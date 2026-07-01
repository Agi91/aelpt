import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// -------------------------------------------------------------------------
// Firebase client configuration
// During standard Next.js build/prerendering, environment variables are
// empty. We provide syntactically valid mock fallbacks to prevent the Client
// SDK from throwing 'auth/invalid-api-key' exceptions.
// -------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] || 'mock-api-key',
  authDomain:
    process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ||
    'mock-auth-domain.firebaseapp.com',
  projectId:
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] || 'mock-project-id',
  storageBucket:
    process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ||
    'mock-project-id.appspot.com',
  messagingSenderId:
    process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] || '000000000000',
  appId:
    process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ||
    '1:000000000000:web:0000000000000000000000',
};

// Initialize Firebase client singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
