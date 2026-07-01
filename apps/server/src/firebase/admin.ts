import * as admin from 'firebase-admin';
import { config } from '../config';

const privateKey = config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: `${config.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const adminApp = admin.app();
export const adminAuth = admin.auth();
