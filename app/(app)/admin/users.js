// app/(app)/admin/users.js
// "Manage Users" screen (admins only).
// Lists ALL users with search and role filter. For each user the admin can:
//   - Verify / Unverify alumni (adds a "✓ Verified" badge)
//   - Remove / Restore the user (removed users are logged out and blocked)
// Tapping a user's name opens their profile.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { COLORS } from "../../../constants/theme";
import Chip from "../../../components/Chip";
import VerifiedBadge from "../../../components/VerifiedBadge";

const ROLES = ["alumni", "student", "admin"];

export default function ManageUsersScreen() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(""); // "" = all roles

  const isAdmin = profile?.role === "admin";

  // Load all users (live), sorted by name.
  useEffect(() => {
    if (!isAdmin) return;
    const stop = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setUsers(list);
        setLoading(false);
      },
      () => {
        setError("Could not load users. Check your internet.");
        setLoading(false);
      }
    );
    return () => stop();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Only admins can manage users.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Turn the "verified" badge on or off for an alumnus.
  async function toggleVerified(person) {
    setError("");
    try {
      await updateDoc(doc(db, "users", person.id), { verified: !person.verified });
    } catch (err) {
      setError("Could not update user. Please try again.");
    }
  }

  // Remove (block) a user, after asking "are you sure?".
  function confirmRemove(person) {
    Alert.alert(
      "Remove user",
      `Remove ${person.name}? They will be logged out and blocked from the app. You can restore them later.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => setRemoved(person, true) },
      ]
    );
  }

  // Set the "removed" flag to true (remove) or false (restore).
  async function setRemoved(person, removed) {
    setError("");
    try {
      await updateDoc(doc(db, "users", person.id), { removed: removed });
    } catch (err) {
      setError("Could not update user. Please try again.");
    }
  }

  // Apply search + role filter.
  const filtered = users.filter((person) => {
    const nameMatches = (person.name || "").toLowerCase().includes(search.toLowerCase());
    const roleMatches = role === "" || person.role === role;
    return nameMatches && roleMatches;
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip label="All" selected={role === ""} onPress={() => setRole("")} />
        {ROLES.map((item) => (
          <Chip key={item} label={item} selected={role === item} onPress={() => setRole(item)} />
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        renderItem={({ item }) => {
          const isMe = item.id === user.uid;
          const isAdminUser = item.role === "admin";

          return (
            <View style={[styles.card, item.removed && styles.removedCard]}>
              {/* Tap the name to open the full profile */}
              <TouchableOpacity onPress={() => router.push(`/alumni/${item.id}`)}>
                <Text style={styles.name}>
                  {item.name}
                  {isMe ? " (you)" : ""}
                </Text>
              </TouchableOpacity>
              <Text style={styles.meta}>{item.email}</Text>

              {/* Labels: role, verified, removed */}
              <View style={styles.tagRow}>
                <Text style={styles.roleTag}>{item.role}</Text>
                {item.verified ? <VerifiedBadge /> : null}
                {item.removed ? <Text style={styles.removedTag}>Removed</Text> : null}
              </View>

              {/* Admin actions. Admins can't be verified or removed from the app. */}
              {!isAdminUser ? (
                <View style={styles.actionRow}>
                  {/* Verify only makes sense for alumni */}
                  {item.role === "alumni" && !item.removed ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.verifyButton]}
                      onPress={() => toggleVerified(item)}
                    >
                      <Text style={styles.actionText}>{item.verified ? "Unverify" : "Verify"}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {item.removed ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.restoreButton]}
                      onPress={() => setRemoved(item, false)}
                    >
                      <Text style={styles.actionText}>Restore</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => confirmRemove(item)}
                    >
                      <Text style={styles.actionText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  chipRow: { flexGrow: 0, marginBottom: 12 },
  error: { color: COLORS.danger, marginBottom: 12 },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 24 },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: COLORS.card,
  },
  removedCard: { opacity: 0.6 }, // faded look for removed users
  name: { fontSize: 17, fontWeight: "bold", color: COLORS.primary },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  roleTag: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  removedTag: {
    backgroundColor: COLORS.danger,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  verifyButton: { backgroundColor: COLORS.success },
  removeButton: { backgroundColor: COLORS.danger },
  restoreButton: { backgroundColor: COLORS.primary },
  actionText: { color: COLORS.white, fontWeight: "bold" },
});
