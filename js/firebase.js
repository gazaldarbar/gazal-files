/* ================================================================
   FIREBASE CONFIGURATION
   ================================================================ */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
} from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBS5RaiVeQse_dwKGFiKKoDozb3Ww2Bt4",
  authDomain: "gazal-darbar-app.firebaseapp.com",
  projectId: "gazal-darbar-app",
  storageBucket: "gazal-darbar-app.firebasestorage.app",
  messagingSenderId: "124649180553",
  appId: "1:124649180553:web:c90bc4c3f859301dcba558"
};


/* ================================================================
   INITIALIZE FIREBASE
   ================================================================ */

const firebaseApp =
  initializeApp(firebaseConfig);


/* ================================================================
   INITIALIZE FIRESTORE DATABASE
   ================================================================ */

const db =
  getFirestore(firebaseApp);

/* ================================================================
   FIRESTORE TEST FUNCTION
   ================================================================ */

async function testFirestoreConnection() {
  try {

    const docRef = await addDoc(
      collection(db, "test"),
      {
        message: "Gazal Darbar Firestore is working",
        createdAt: new Date().toISOString()
      }
    );

    console.log(
      "Firestore test successful:",
      docRef.id
    );

  } catch (error) {

    console.error(
      "Firestore test failed:",
      error
    );

  }
}


/* ================================================================
   FIREBASE TEST
   ================================================================ */

console.log(
  "Firebase connected:",
  firebaseApp.name
);

console.log(
  "Firestore connected:",
  db
);


/* ================================================================
   EXPORT FIRESTORE
   ================================================================ */

export {
  db,
  testFirestoreConnection
};
