// app/_layout.js
// The "layout" wraps every screen in the app.
// Expo Router reads the "app" folder: each file in it becomes a screen.
// <Stack /> means screens are stacked on top of each other (like a pile of cards),
// and the phone's back button goes back to the previous screen.

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
