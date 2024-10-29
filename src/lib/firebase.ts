// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    databaseURL: "https://ico-kyc-default-rtdb.firebaseio.com/",
    // Le altre configurazioni verranno caricate dal file di credenziali
    // Non è necessario includerle qui poiché stai usando un file di service account
  };
  
  const app = initializeApp(firebaseConfig);
  export const database = getDatabase(app);