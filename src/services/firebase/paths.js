import { collection, doc } from 'firebase/firestore';
import { appId, db, isPreviewEnv } from './client';

const getCollectionRef = (collectionName) =>
  isPreviewEnv
    ? collection(db, 'artifacts', appId, 'public', 'data', collectionName)
    : collection(db, collectionName);

const getDocRef = (collectionName, id) =>
  isPreviewEnv
    ? doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)
    : doc(db, collectionName, id);

export { getCollectionRef, getDocRef };
