// app/(app)/(tabs)/admin.js
// The Admin Dashboard (only admins can see this tab).
// Shows stats about users and events, a button to manage users,
// and a button to export alumni data as a CSV file.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { COLORS } from "../../../constants/theme";
import { formatDate, todayString } from "../../../utils/formatDate";
import { shareAlumniCsv } from "../../../utils/exportCsv";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const isAdmin = profile?.role === "admin";

  // Load ALL users (live).
  useEffect(() => {
    if (!isAdmin) return; // non-admins never load this data
    const stop = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingUsers(false);
      },
      () => {
        setError("Could not load users. Check your internet.");
        setLoadingUsers(false);
      }
    );
    return () => stop();
  }, [isAdmin]);

  // Load UPCOMING events only: date is today or later, earliest first.
  useEffect(() => {
    if (!isAdmin) return;
    const upcomingQuery = query(
      collection(db, "events"),
      where("date", ">=", todayString()),
      orderBy("date")
    );
    const stop = onSnapshot(
      upcomingQuery,
      (snapshot) => {
        setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingEvents(false);
      },
      () => {
        setError("Could not load events. Check your internet.");
        setLoadingEvents(false);
      }
    );
    return () => stop();
  }, [isAdmin]);

  // Safety check: only admins may see this screen.
  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Only admins can view this page.</Text>
      </View>
    );
  }

  if (loadingUsers || loadingEvents) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ---------- Work out the stats ----------
  // Ignore users that an admin has removed.
  const activeUsers = users.filter((u) => !u.removed);
  const alumni = activeUsers.filter((u) => u.role === "alumni");
  const students = activeUsers.filter((u) => u.role === "student");
  const verifiedCount = alumni.filter((u) => u.verified).length;

  // Count alumni per graduation year, e.g. { "2022": 3, "2023": 5 }.
  const byYear = countBy(alumni, "graduationYear");
  // Count alumni per branch, e.g. { "CSE": 4, "ECE": 2 }.
  const byBranch = countBy(alumni, "branch");

  // Export alumni as CSV and open the Share menu.
  async function handleExport() {
    setError("");
    setExporting(true);
    try {
      // Sort by name so the spreadsheet is tidy.
      const sorted = [...alumni].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      await shareAlumniCsv(sorted);
    } catch (err) {
      setError("Could not export the CSV file. Please try again.");
    }
    setExporting(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Four stat boxes in a 2 x 2 grid */}
      <View style={styles.statGrid}>
        <StatBox label="Alumni" value={alumni.length} />
        <StatBox label="Students" value={students.length} />
        <StatBox label="Verified Alumni" value={verifiedCount} />
        <StatBox label="Upcoming Events" value={events.length} />
      </View>

      {/* Action buttons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push("/admin/users")}>
        <Text style={styles.buttonText}>👥 Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.exportButton]}
        onPress={handleExport}
        disabled={exporting || alumni.length === 0}
      >
        {exporting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>📤 Export Alumni (CSV)</Text>
        )}
      </TouchableOpacity>

      {/* Bar charts made from plain Views (no chart library needed) */}
      <Text style={styles.sectionTitle}>Alumni by Graduation Year</Text>
      <BarList counts={byYear} total={alumni.length} />

      <Text style={styles.sectionTitle}>Alumni by Branch</Text>
      <BarList counts={byBranch} total={alumni.length} />

      {/* Upcoming events */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No upcoming events.</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventMeta}>
              📅 {formatDate(event.date)} • {(event.rsvps || []).length} going
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// Count how many items have each value of a field.
// Items with an empty value are counted under "Not set".
function countBy(items, field) {
  const counts = {};
  items.forEach((item) => {
    const key = item[field] || "Not set";
    counts[key] = (counts[key] || 0) + 1; // start at 0 if this key is new, then add 1
  });
  return counts;
}

// One stat box: big number + label.
function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// A simple horizontal bar chart: one row per key, bar width = share of the total.
function BarList({ counts, total }) {
  const keys = Object.keys(counts).sort();
  if (keys.length === 0) {
    return <Text style={styles.empty}>No alumni yet.</Text>;
  }
  return keys.map((key) => (
    <View key={key} style={styles.barRow}>
      <Text style={styles.barLabel}>{key}</Text>
      <View style={styles.barTrack}>
        {/* e.g. 3 out of 10 alumni -> bar is 30% wide */}
        <View style={[styles.barFill, { width: `${(counts[key] / total) * 100}%` }]} />
      </View>
      <Text style={styles.barCount}>{counts[key]}</Text>
    </View>
  ));
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  error: { color: COLORS.danger, marginBottom: 12 },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // wrap onto a second line -> 2 x 2 grid
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%", // two boxes per row
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 28, fontWeight: "bold", color: COLORS.primaryDark },
  statLabel: { fontSize: 13, color: COLORS.text, marginTop: 4 },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  exportButton: { backgroundColor: COLORS.success },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: { color: COLORS.textMuted },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barLabel: { width: 70, fontSize: 14, color: COLORS.text },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: COLORS.borderLight,
    borderRadius: 7,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: COLORS.primary },
  barCount: { width: 30, textAlign: "right", fontSize: 14, color: COLORS.text },
  eventRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginBottom: 8,
  },
  eventTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.text },
  eventMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
