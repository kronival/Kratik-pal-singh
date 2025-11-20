
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB_b1gJxvP05InQM4e-qZSgrV04jEn-Dt0",
  authDomain: "ajanta-b6754.firebaseapp.com",
  projectId: "ajanta-b6754",
  storageBucket: "ajanta-b6754.firebasestorage.app",
  messagingSenderId: "690931309048",
  appId: "1:690931309048:web:26e03d2c13ca1a4a83de0d",
  measurementId: "G-CMG6V7MDPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics: any = null;

// Initialize analytics asynchronously and dynamically to prevent static import errors
// which can occur if firebase/analytics types are not correctly resolved in the environment
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then((firebaseAnalytics: any) => {
      if (typeof firebaseAnalytics.isSupported === 'function') {
          firebaseAnalytics.isSupported().then((supported: boolean) => {
            if (supported && typeof firebaseAnalytics.getAnalytics === 'function') {
              analytics = firebaseAnalytics.getAnalytics(app);
              console.log("Firebase Analytics initialized");
            }
          }).catch((err: any) => {
            console.warn("Firebase Analytics not supported in this environment:", err);
          });
      }
    })
    .catch((err) => {
      console.warn("Failed to load firebase/analytics", err);
    });
}

console.log("Firebase Initialized:", app.name);

export { app, analytics };
