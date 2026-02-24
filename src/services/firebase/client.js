import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAmlZ0pBAlg32Oe-BNdvOiv5duMcZejJIo',
  authDomain: 'putra-buana.firebaseapp.com',
  projectId: 'putra-buana',
  storageBucket: 'putra-buana.firebasestorage.app',
  messagingSenderId: '899565407722',
  appId: '1:899565407722:web:1f75d3eb670857ef86b693',
  measurementId: 'G-DVQM808MQP',
};

let firebaseConfig = defaultFirebaseConfig;
let appId = 'default-app-id';
let isPreviewEnv = false;

try {
  if (typeof globalThis.__firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(globalThis.__firebase_config);
    appId = globalThis.__app_id || 'default-app-id';
    isPreviewEnv = true;
  }
} catch (error) {
  console.warn('Menggunakan konfigurasi fallback karena error parsing config.', error);
  firebaseConfig = { apiKey: 'demo', authDomain: 'demo', projectId: 'demo' };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getInitialAuthToken = () => globalThis.__initial_auth_token;

export { appId, auth, db, getInitialAuthToken, isPreviewEnv };
