// firebaseConfig.js
// This file connects our app to Firebase.
// Every other file that needs Firebase will import "auth" or "db" from here.

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Our Firebase keys. They are read from the .env file (never written here directly).
// Expo only lets the app read .env values whose names start with EXPO_PUBLIC_.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Start Firebase using our keys.
const app = initializeApp(firebaseConfig);

// Firebase Authentication (login / sign up).
// AsyncStorage saves the login on the phone, so the user stays logged in
// even after closing the app.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore = our database (we will store users, events and jobs here).
export const db = getFirestore(app);
