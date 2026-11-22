// app/(app)/events/create.js
// The "Create Event" form. Only admins can use it.
// It saves a new document in the Firestore "events" collection.

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
import { isValidDate } from "../../../utils/formatDate";

export default function CreateEventScreen() {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Safety check: if a non-admin somehow opens this screen, don't show the form.
  if (profile?.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Only admins can create events.</Text>
      </View>
    );
  }

  async function handleCreate() {
    setError("");

    // Simple checks before saving.
    if (!title.trim() || !description.trim() || !date.trim() || !venue.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isValidDate(date.trim())) {
      setError("Date must be a real date in the format YYYY-MM-DD, e.g. 2026-12-15.");
      return;
    }

    setBusy(true);
    try {
      // addDoc creates a new document with an automatic id.
      await addDoc(collection(db, "events"), {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(), // stored as "YYYY-MM-DD" so sorting by date works
        venue: venue.trim(),
        rsvps: [], // nobody has RSVP'd yet
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      router.back(); // go back to the Events list
    } catch (err) {
      setError("Could not create event. Please try again.");
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Alumni Meet 2026" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="What is this event about?"
        multiline // allows several lines of text
      />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-12-15"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <Text style={styles.label}>Venue</Text>
      <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="Main Auditorium" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Event</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  label: { fontSize: 14, color: "#666", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multiline: { height: 100, textAlignVertical: "top" }, // taller box, text starts at top
  error: { color: "red", marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
