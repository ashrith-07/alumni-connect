// app/(auth)/signup.js
// The Sign Up screen: name, email, password, and role (alumni or student).
// It creates the account in Firebase Auth AND saves the user's info in Firestore.

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { getAuthErrorMessage } from "../../utils/authErrors";
import { COLORS } from "../../constants/theme";
import AppInput from "../../components/AppInput";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // "student" or "alumni"
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Runs when the "Sign Up" button is tapped.
  async function handleSignup() {
    setError("");

    // Simple checks before contacting Firebase.
    if (!name.trim() || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      // 1. Create the login account in Firebase Authentication.
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Save extra info in Firestore: collection "users", document id = the user's uid.
      //    Using the uid as the id makes it easy to find this user's data later.
      await setDoc(doc(db, "users", result.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: role,
        createdAt: serverTimestamp(), // the time on Firebase's server
      });
      // After this, AuthContext notices the new login and opens the home screen.
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
    setBusy(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Account</Text>

      <AppInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />

      <AppInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AppInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Role choice: two buttons. The selected one is coloured blue. */}
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleButton, role === "student" && styles.roleSelected]}
          onPress={() => setRole("student")}
        >
          <Text style={role === "student" ? styles.roleTextSelected : styles.roleText}>
            Student
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "alumni" && styles.roleSelected]}
          onPress={() => setRole("alumni")}
        >
          <Text style={role === "alumni" ? styles.roleTextSelected : styles.roleText}>
            Alumni
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: COLORS.white },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  label: { color: COLORS.text, fontSize: 16, marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 16 }, // side by side
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  roleSelected: { backgroundColor: COLORS.primary },
  roleText: { color: COLORS.primary, fontWeight: "bold" },
  roleTextSelected: { color: COLORS.white, fontWeight: "bold" },
  error: { color: COLORS.danger, marginBottom: 12 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  link: { color: COLORS.primary, textAlign: "center", marginTop: 16 },
});
