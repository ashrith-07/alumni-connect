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
  StyleSheet,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { BRANCHES } from "../../../constants/branches";
import InfoRow from "../../../components/InfoRow";
import { openLink } from "../../../utils/openLink";
import { COLORS } from "../../../constants/theme";

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
        <ActivityIndicator size="large" color={COLORS.primary} />
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

  // ---------- VIEW MODE ----------
  if (!editing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
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

        {/* LinkedIn: tappable link that opens the browser */}
        <InfoRow
          label="LinkedIn"
          value={profile.linkedin}
          onPress={() => openLink(profile.linkedin)}
        />

        <TouchableOpacity style={styles.button} onPress={startEditing}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---------- EDIT MODE ----------
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Save</Text>}
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 24, backgroundColor: COLORS.white, flexGrow: 1 },
  name: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  role: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
    textTransform: "capitalize", // "alumni" -> "Alumni"
    marginBottom: 16,
  },
  success: { color: COLORS.success, textAlign: "center", marginBottom: 12 },
  label: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.primary },
  chipTextSelected: { color: COLORS.white },
  error: { color: COLORS.danger, marginBottom: 12 },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 14, alignItems: "center", marginTop: 8 },
  cancelText: { color: COLORS.textMuted, fontSize: 16 },
});
