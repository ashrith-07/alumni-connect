// app/index.js
// This is the first screen you see when the app opens (the "home" route "/").
// For now it only checks that Firebase is connected.

import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { auth, db } from "../firebaseConfig";

export default function HomeScreen() {
  // Read the project ID back from Firebase. If .env was filled correctly,
  // this shows your Firebase project's name. If not, it shows "undefined".
  const projectId = auth.app.options.projectId;

  return (
    <View style={styles.container}>
      {/* Sets the title shown in the top bar */}
      <Stack.Screen options={{ title: "Alumni Connect" }} />

      <Text style={styles.title}>Alumni Connect</Text>
      <Text>Firebase project: {String(projectId)}</Text>
      <Text>Firestore ready: {db ? "Yes" : "No"}</Text>
    </View>
  );
}

// Styles work like CSS, but written as JavaScript objects.
const styles = StyleSheet.create({
  container: {
    flex: 1, // take up the whole screen
    alignItems: "center", // center horizontally
    justifyContent: "center", // center vertically
    gap: 8, // space between items
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
