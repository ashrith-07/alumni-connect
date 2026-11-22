// app/(auth)/login.js
// The Login screen: the user types email + password and taps "Log In".

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { getAuthErrorMessage } from "../../utils/authErrors";

export default function LoginScreen() {
  // "State" = values that can change while the screen is open.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // error message to show (empty = none)
  const [busy, setBusy] = useState(false); // true while waiting for Firebase

  // Runs when the "Log In" button is tapped.
  async function handleLogin() {
    setError("");

    // Simple check before contacting Firebase.
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      // Ask Firebase to log in. If it works, AuthContext notices
      // and the app automatically moves to the home screen.
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alumni Connect</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // update "email" every time the user types
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // hides the password with dots
      />

      {/* Only show the error text if there is an error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      {/* Link to the signup screen */}
      <Link href="/signup" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: { color: "red", marginBottom: 12 },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#2563eb", textAlign: "center", marginTop: 16 },
});
