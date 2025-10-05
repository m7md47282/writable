import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function initializeFirebaseAdmin(): App {
  if (!app) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
  return app;
}

export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    const firebaseApp = initializeFirebaseAdmin();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getFirebaseAdminFirestore(): Firestore {
  if (!db) {
    const firebaseApp = initializeFirebaseAdmin();
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function getFirebaseAdminApp(): App {
  return initializeFirebaseAdmin();
}

export { auth, db };
