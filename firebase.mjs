// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDVpmv_M0cVDlMaJ6bLdbylg5B48EYPcts",

  authDomain: "tutoring-app-368813.firebaseapp.com",

  projectId: "tutoring-app-368813",

  storageBucket: "tutoring-app-368813.appspot.com",

  messagingSenderId: "1065509707622",

  appId: "1:1065509707622:web:e8f4ced7a0111c35df72a7",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
