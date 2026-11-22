// app/(app)/(tabs)/index.js
// The Home tab, shown after logging in.
// It greets the user by name, shows their role, and has a Log Out button.

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

export default function HomeScreen() {
  // Read the logged-in user and their Firestore profile from AuthContext.
  const { user, profile } = useAuth();

  // Log out. AuthContext notices and the app moves to the login screen automatically.
  function handleLogout() {
    signOut(auth);
  }

  return (
    <View style={styles.container}>
      {/* profile can be empty for a moment right after signup, so use "?." to be safe */}
      <Text style={styles.title}>Welcome, {profile?.name || "there"}!</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Role: {profile?.role || "..."}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: "bold" },
  info: { fontSize: 16, color: "#444" },
  button: {
    marginTop: 24,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
