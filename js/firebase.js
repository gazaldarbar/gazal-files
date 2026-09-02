/* ================================================================
   FIREBASE CONFIGURATION
   ================================================================ */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";


const firebaseConfig = {
  apiKey: "AIzaSyBS5RaiVeQse_dwKGFiKKoDozb3Ww2Bt4",
  authDomain: "gazal-darbar-app.firebaseapp.com",
  projectId: "gazal-darbar-app",
  storageBucket: "gazal-darbar-app.firebasestorage.app",
  messagingSenderId: "124649180553",
  appId: "1:124649180553:web:c90bc4c3f859301dcba558"
};


const firebaseApp =
  initializeApp(firebaseConfig);


/* Firebase is now initialized */
console.log(
  "Firebase connected:",
  firebaseApp.name
);
