/* ================================================================
   FIREBASE CONFIGURATION
   ================================================================ */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
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

    alert(
      "Firestore test successful! Document ID: " +
      docRef.id
    );

  } catch (error) {

    alert(
      "Firestore test failed: " +
      error.message
    );

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
   STUDENT FIRESTORE FUNCTIONS
   ================================================================ */


/* Save one student to Firestore */

async function saveStudentToFirestore(student) {
  try {

    const docRef = await addDoc(
      collection(db, "students"),
      student
    );

    console.log(
      "Student saved to Firestore:",
      docRef.id
    );

    return docRef.id;

  } catch (error) {

    console.error(
      "Student save failed:",
      error
    );

    throw error;
  }
}


/* Load all students from Firestore */

async function getStudentsFromFirestore() {
  try {

    const snapshot = await getDocs(
      collection(db, "students")
    );

    const students = [];

    snapshot.forEach((doc) => {

      students.push({
        firestoreId: doc.id,
        ...doc.data()
      });

    });

    return students;

  } catch (error) {

    console.error(
      "Failed to load students:",
      error
    );

    throw error;
  }
}

/* ================================================================
   EXPORT FIRESTORE
   ================================================================ */

export {
  db,
  testFirestoreConnection,
  saveStudentToFirestore,
  getStudentsFromFirestore
};
