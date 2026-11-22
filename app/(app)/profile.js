// app/(app)/profile.js
// The Profile screen. It has two modes:
//   1. VIEW mode: shows the user's details.
//   2. EDIT mode: shows a form to change them, with Save and Cancel buttons.
// Data is saved in Firestore: users -> (the user's uid).

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { BRANCHES } from "../../constants/branches";

export default function ProfileScreen() {
  // user = Firebase login (has uid, email). profile = our data from Firestore.
  // profile updates automatically after saving (AuthContext listens with onSnapshot).
  const { user, profile } = useAuth();

  const [editing, setEditing] = useState(false); // false = view mode, true = edit mode
  const [busy, setBusy] = useState(false); // true while saving
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // success message

  // Form values (only used in edit mode).
  const [name, setName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Profile data may take a moment to load from Firestore.
  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Switch to edit mode, filling the form with the current saved values.
  function startEditing() {
    setName(profile.name || "");
    setGraduationYear(profile.graduationYear || "");
    setBranch(profile.branch || "");
    setCompany(profile.company || "");
    setJobTitle(profile.jobTitle || "");
    setPhone(profile.phone || "");
    setLinkedin(profile.linkedin || "");
    setError("");
    setMessage("");
    setEditing(true);
  }

  // Save the form to Firestore.
  async function handleSave() {
    setError("");

    // Simple checks.
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    // If a year is typed, it must be exactly 4 digits (e.g. 2024).
    if (graduationYear && !/^\d{4}$/.test(graduationYear)) {
      setError("Graduation year must be 4 digits, e.g. 2024.");
      return;
    }

    setBusy(true);
    try {
      // setDoc with { merge: true } updates only these fields and keeps
      // the others (like email, role, createdAt) as they are.
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          graduationYear: graduationYear.trim(),
          branch: branch,
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          phone: phone.trim(),
          linkedin: linkedin.trim(),
        },
        { merge: true }
      );
      setEditing(false); // back to view mode
      setMessage("Profile saved!");
    } catch (err) {
      setError("Could not save profile. Check your internet and try again.");
    }
    setBusy(false);
  }

  // Open the LinkedIn link in the phone's browser.
  function openLinkedin() {
    let url = profile.linkedin;
    // Add "https://" if the user didn't type it, so the phone knows it's a web link.
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    Linking.openURL(url);
  }

  // ---------- VIEW MODE ----------
  if (!editing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ title: "My Profile" }} />

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.role}</Text>

        {message ? <Text style={styles.success}>{message}</Text> : null}

        {/* Each row shows a label and its value ("-" if empty) */}
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Graduation Year" value={profile.graduationYear} />
        <InfoRow label="Branch" value={profile.branch} />
        <InfoRow label="Company" value={profile.company} />
        <InfoRow label="Job Title" value={profile.jobTitle} />
        <InfoRow label="Phone" value={profile.phone} />

        {/* LinkedIn: tappable if filled in */}
        <View style={styles.row}>
          <Text style={styles.label}>LinkedIn</Text>
          {profile.linkedin ? (
            <Text style={styles.link} onPress={openLinkedin}>
              {profile.linkedin}
            </Text>
          ) : (
            <Text style={styles.value}>-</Text>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={startEditing}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---------- EDIT MODE ----------
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Edit Profile" }} />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Graduation Year</Text>
      <TextInput
        style={styles.input}
        value={graduationYear}
        onChangeText={setGraduationYear}
        placeholder="e.g. 2024"
        keyboardType="number-pad" // shows a number keyboard
        maxLength={4}
      />

      {/* Branch: tap one of the buttons. The selected one turns blue. */}
      <Text style={styles.label}>Branch</Text>
      <View style={styles.chipRow}>
        {BRANCHES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, branch === item && styles.chipSelected]}
            onPress={() => setBranch(item)}
          >
            <Text style={branch === item ? styles.chipTextSelected : styles.chipText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Company</Text>
      <TextInput style={styles.input} value={company} onChangeText={setCompany} />

      <Text style={styles.label}>Job Title</Text>
      <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>LinkedIn URL</Text>
      <TextInput
        style={styles.input}
        value={linkedin}
        onChangeText={setLinkedin}
        placeholder="linkedin.com/in/your-name"
        autoCapitalize="none"
        keyboardType="url"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setEditing(false)}
        disabled={busy}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// A small reusable piece that shows one "label: value" row.
function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  name: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  role: {
    fontSize: 16,
    color: "#2563eb",
    textAlign: "center",
    textTransform: "capitalize", // "alumni" -> "Alumni"
    marginBottom: 16,
  },
  success: { color: "green", textAlign: "center", marginBottom: 12 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 14, color: "#666", marginBottom: 4 },
  value: { fontSize: 16 },
  link: { fontSize: 16, color: "#2563eb", textDecorationLine: "underline" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: "#2563eb" },
  chipText: { color: "#2563eb" },
  chipTextSelected: { color: "#fff" },
  error: { color: "red", marginBottom: 12 },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 14, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#666", fontSize: 16 },
});
