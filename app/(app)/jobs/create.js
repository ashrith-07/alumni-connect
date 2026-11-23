// app/(app)/jobs/create.js
// The "Post a Job" form. Only alumni can use it.
// It saves a new document in the Firestore "jobs" collection.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import Chip from "../../../components/Chip";
import { COLORS } from "../../../constants/theme";

export default function PostJobScreen() {
  const { user, profile } = useAuth();

  const [type, setType] = useState("Job"); // "Job" or "Internship"
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Safety check: if a non-alumni user somehow opens this screen, don't show the form.
  if (profile?.role !== "alumni") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Only alumni can post jobs.</Text>
      </View>
    );
  }

  async function handlePost() {
    setError("");

    // Simple checks before saving.
    if (!title.trim() || !company.trim() || !description.trim() || !applyLink.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    // A web link must at least contain a dot, e.g. "careers.google.com".
    if (!applyLink.includes(".")) {
      setError("Please enter a valid apply link, e.g. careers.google.com");
      return;
    }

    setBusy(true);
    try {
      await addDoc(collection(db, "jobs"), {
        type: type,
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        applyLink: applyLink.trim(),
        postedBy: user.uid, // who posted it (their uid)
        postedByName: profile.name, // their name, so we can show it on the card
        createdAt: serverTimestamp(), // used to sort newest first
      });
      router.back(); // go back to the Jobs list
    } catch (err) {
      setError("Could not post job. Please try again.");
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Choose Job or Internship */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        <Chip label="Job" selected={type === "Job"} onPress={() => setType("Job")} />
        <Chip
          label="Internship"
          selected={type === "Internship"}
          onPress={() => setType("Internship")}
        />
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Frontend Developer"
      />

      <Text style={styles.label}>Company</Text>
      <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="Google" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Role, skills needed, location, etc."
        multiline
      />

      <Text style={styles.label}>Apply Link</Text>
      <TextInput
        style={styles.input}
        value={applyLink}
        onChangeText={setApplyLink}
        placeholder="careers.google.com/jobs/123"
        autoCapitalize="none"
        keyboardType="url"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handlePost} disabled={busy}>
        {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Post Job</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  container: { padding: 24, backgroundColor: COLORS.white, flexGrow: 1 },
  label: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  chipRow: { flexDirection: "row", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multiline: { height: 100, textAlignVertical: "top" },
  error: { color: COLORS.danger, marginBottom: 12 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});
