// app/(app)/(tabs)/index.js
// The Home tab, shown after logging in.
// It shows a welcome card, shortcut buttons to the other tabs, and a Log Out button.

import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  // Read the logged-in user and their Firestore profile from AuthContext.
  const { user, profile } = useAuth();

  // profile can be empty for a moment right after signup, so use "?." to be safe.
  const name = profile?.name || "there";
  const role = profile?.role || "";

  // Ask "are you sure?" before logging out.
  // AuthContext notices the logout and the app moves to the login screen automatically.
  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => signOut(auth) },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome card */}
      <View style={styles.card}>
        {/* Circle with the first letter of the user's name */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>Welcome, {name}!</Text>
        <Text style={styles.email}>{user.email}</Text>
        {role ? <Text style={styles.badge}>{role}</Text> : null}
      </View>

      {/* Shortcut buttons that jump to other tabs */}
      <Text style={styles.sectionTitle}>Quick links</Text>
      <Shortcut icon="people-outline" label="Alumni Directory" onPress={() => router.push("/directory")} />
      <Shortcut icon="calendar-outline" label="Upcoming Events" onPress={() => router.push("/events")} />
      <Shortcut icon="briefcase-outline" label="Jobs Board" onPress={() => router.push("/jobs")} />
      <Shortcut icon="person-outline" label="My Profile" onPress={() => router.push("/profile")} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// One shortcut row: icon + label on the left, arrow on the right.
function Shortcut({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.shortcut} onPress={onPress}>
      <View style={styles.shortcutLeft}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.shortcutText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  card: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32, // half the width = a perfect circle
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  badge: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden", // needed on iPhone so the rounded corners show
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 8 },
  shortcut: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    marginBottom: 10,
  },
  shortcutLeft: { flexDirection: "row", alignItems: "center", gap: 12 }, // icon next to label
  shortcutText: { fontSize: 16, color: COLORS.text },
  logoutButton: {
    flexDirection: "row", // icon and text side by side
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: "center",
  },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: "bold" },
});
