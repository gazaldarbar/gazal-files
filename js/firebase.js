/* ================================================================
   FIREBASE CONFIGURATION
   ================================================================ */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc
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

    const studentDocRef = doc(
      db,
      "students",
      student.id
    );

    await setDoc(
      studentDocRef,
      student,
      {
        merge: true
      }
    );

    console.log(
      "Student saved to Firestore:",
      student.id
    );

    return student.id;

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
   GET ONE STUDENT FROM FIRESTORE
   ================================================================ */

async function getStudentFromFirestore(studentId) {
  try {

    const studentDocRef = doc(
      db,
      "students",
      studentId
    );

    const studentSnapshot =
      await getDoc(studentDocRef);

    if (!studentSnapshot.exists()) {
      return null;
    }

    return {
      id: studentSnapshot.id,
      ...studentSnapshot.data()
    };

  } catch (error) {

    console.error(
      "Failed to load student:",
      error
    );

    throw error;
  }
}


/* ================================================================
   DELETE STUDENT FROM FIRESTORE
   ================================================================ */

async function deleteStudentFromFirestore(studentId) {
  try {

    const studentDocRef = doc(
      db,
      "students",
      studentId
    );

    await deleteDoc(studentDocRef);

    console.log(
      "Student deleted from Firestore:",
      studentId
    );

  } catch (error) {

    console.error(
      "Failed to delete student:",
      error
    );

    throw error;
  }
}

/* ================================================================
   ATTENDANCE FIRESTORE FUNCTIONS
   ================================================================ */

async function saveAttendanceToFirestore(
  attendanceRecord
) {
  try {

    const attendanceId =
      `${attendanceRecord.course}_${attendanceRecord.date}`;

    const attendanceDocRef = doc(
      db,
      "attendance",
      attendanceId
    );

    await setDoc(
      attendanceDocRef,
      attendanceRecord
    );

    console.log(
      "Attendance saved to Firestore:",
      attendanceId
    );

    return attendanceId;

  } catch (error) {

    console.error(
      "Attendance save failed:",
      error
    );

    throw error;
  }
}


async function getStudentsForAttendance() {

  return await getStudentsFromFirestore();

}

/* ================================================================
   LOAD ATTENDANCE FROM FIRESTORE
   ================================================================ */

async function getAttendanceFromFirestore() {
  try {

    const snapshot = await getDocs(
      collection(db, "attendance")
    );

    const attendanceRecords = [];

    snapshot.forEach((attendanceDoc) => {

      attendanceRecords.push({
        firestoreId: attendanceDoc.id,
        ...attendanceDoc.data()
      });

    });

    return attendanceRecords;

  } catch (error) {

    console.error(
      "Failed to load attendance:",
      error
    );

    throw error;
  }
}

/* ================================================================
   MAKE FIRESTORE FUNCTIONS AVAILABLE TO APP.JS
   ================================================================ */

window.saveStudentToFirestore =
  saveStudentToFirestore;

window.getStudentsFromFirestore =
  getStudentsFromFirestore;

window.getStudentFromFirestore =
  getStudentFromFirestore;

window.deleteStudentFromFirestore =
  deleteStudentFromFirestore;

window.saveAttendanceToFirestore =
  saveAttendanceToFirestore;

window.getAttendanceFromFirestore =
  getAttendanceFromFirestore;

window.getStudentsForAttendance =
  getStudentsForAttendance;

/* ================================================================
   EXPORT FIRESTORE
   ================================================================ */

export {
  db,
  testFirestoreConnection,
  saveStudentToFirestore,
  getStudentsFromFirestore,
  getStudentFromFirestore,
  deleteStudentFromFirestore,
  saveAttendanceToFirestore,
  getAttendanceFromFirestore,
  getStudentsForAttendance
};
