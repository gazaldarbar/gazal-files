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
   FEE PAYMENTS FIRESTORE FUNCTIONS
   ================================================================ */


/* Save one fee payment */

async function saveFeePaymentToFirestore(payment) {
  try {

    const paymentId =
      `${payment.studentId}_${payment.monthNumber}`;

    const paymentDocRef = doc(
      db,
      "fee_payments",
      paymentId
    );

    await setDoc(
      paymentDocRef,
      payment,
      {
        merge: true
      }
    );

    console.log(
      "Fee payment saved to Firestore:",
      paymentId
    );

    return paymentId;

  } catch (error) {

    console.error(
      "Fee payment save failed:",
      error
    );

    throw error;
  }
}


/* Load all fee payments */

async function getFeePaymentsFromFirestore() {
  try {

    const snapshot = await getDocs(
      collection(db, "fee_payments")
    );

    const payments = [];

    snapshot.forEach((paymentDoc) => {

      payments.push({
        firestoreId: paymentDoc.id,
        ...paymentDoc.data()
      });

    });

    return payments;

  } catch (error) {

    console.error(
      "Failed to load fee payments:",
      error
    );

    throw error;
  }
}

/* ================================================================
   APP SHARED PIN SECURITY
   ================================================================ */

const APP_SECURITY_COLLECTION =
  "app_settings";

const APP_SECURITY_DOCUMENT =
  "security";


/* ------------------------------------------------
   Get shared PIN hash
   ------------------------------------------------ */

async function getSharedPinHash() {

  try {

    const securityDocRef =
      doc(
        db,
        APP_SECURITY_COLLECTION,
        APP_SECURITY_DOCUMENT
      );


    const securitySnapshot =
      await getDoc(
        securityDocRef
      );


    if (
      !securitySnapshot.exists()
    ) {

      return null;

    }


    return (
      securitySnapshot.data()
        .pinHash || null
    );

  } catch (error) {

    console.error(
      "Failed to load shared PIN:",
      error
    );

    throw error;

  }

}


/* ------------------------------------------------
   Save or change shared PIN hash
   ------------------------------------------------ */

async function saveSharedPinHash(
  pinHash
) {

  try {

    const securityDocRef =
      doc(
        db,
        APP_SECURITY_COLLECTION,
        APP_SECURITY_DOCUMENT
      );


    await setDoc(
      securityDocRef,
      {

        pinHash:
          pinHash,

        updatedAt:
          new Date()
            .toISOString()

      },

      {
        merge:
          true
      }
    );


    console.log(
      "Shared PIN updated successfully."
    );

  } catch (error) {

    console.error(
      "Failed to save shared PIN:",
      error
    );

    throw error;

  }

}

/* ================================================================
   NOTES FIRESTORE FUNCTIONS
   ================================================================ */


/* ------------------------------------------------
   SAVE NOTE
   ------------------------------------------------ */

async function saveNoteToFirestore(
  note
) {

  try {

    const noteDocRef =
      doc(
        db,
        "notes",
        note.id
      );


    await setDoc(
      noteDocRef,
      note,
      {
        merge: true
      }
    );


    console.log(
      "Note saved to Firestore:",
      note.id
    );


    return note.id;

  } catch (error) {

    console.error(
      "Failed to save note:",
      error
    );

    throw error;

  }

}


/* ------------------------------------------------
   LOAD ALL NOTES
   ------------------------------------------------ */

async function getNotesFromFirestore() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "notes"
        )
      );


    const notes =
      [];


    snapshot.forEach(
      (noteDoc) => {

        notes.push({
          firestoreId:
            noteDoc.id,

          ...noteDoc.data()
        });

      }
    );


    return notes;

  } catch (error) {

    console.error(
      "Failed to load notes:",
      error
    );

    throw error;

  }

}


/* ------------------------------------------------
   DELETE NOTE
   ------------------------------------------------ */

async function deleteNoteFromFirestore(
  noteId
) {

  try {

    const noteDocRef =
      doc(
        db,
        "notes",
        noteId
      );


    await deleteDoc(
      noteDocRef
    );


    console.log(
      "Note deleted from Firestore:",
      noteId
    );

  } catch (error) {

    console.error(
      "Failed to delete note:",
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

window.saveFeePaymentToFirestore =
  saveFeePaymentToFirestore;

window.getFeePaymentsFromFirestore =
  getFeePaymentsFromFirestore;

window.getSharedPinHash =
  getSharedPinHash;

window.saveSharedPinHash =
  saveSharedPinHash;

window.saveNoteToFirestore =
  saveNoteToFirestore;

window.getNotesFromFirestore =
  getNotesFromFirestore;

window.deleteNoteFromFirestore =
  deleteNoteFromFirestore;

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
  getStudentsForAttendance,
  saveFeePaymentToFirestore,
  getFeePaymentsFromFirestore,
  getSharedPinHash,
  saveSharedPinHash,
  saveNoteToFirestore,
  getNotesFromFirestore,
  deleteNoteFromFirestore
};
