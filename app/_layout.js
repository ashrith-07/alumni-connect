// app/_layout.js
// The ROOT layout wraps every screen in the app.
// Expo Router reads the "app" folder: each file in it becomes a screen.
// Folders in (brackets) are "groups": they organise screens but do NOT appear in the URL.
//   app/(auth)  -> screens for logged-OUT users (login, signup)
//   app/(app)   -> screens for logged-IN users (home, and later profile, events...)

import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    // AuthProvider lets every screen know who is logged in.
    <AuthProvider>
      {/* Slot = "show whichever screen is currently open here" */}
      <Slot />
    </AuthProvider>
  );
}
