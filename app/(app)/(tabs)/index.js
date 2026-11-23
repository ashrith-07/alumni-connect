// app/(app)/(tabs)/index.js
// The Home tab, shown after logging in. It is a live "summary" of the app:
//   - a welcome card
//   - community numbers (alumni and students)
//   - a reminder to complete your profile (only if it is incomplete)
//   - the next 3 upcoming events and the 3 newest jobs
// The bottom tabs already handle navigation, so there are no shortcut buttons here.

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { COLORS } from "../../../constants/theme";
import { formatDate, todayString } from "../../../utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import IconText from "../../../components/IconText";

// The profile fields we ask everyone to fill in.
const PROFILE_FIELDS = ["graduationYear", "branch", "company", "jobTitle", "phone", "linkedin"];

export default function HomeScreen() {
  const { profile } = useAuth();

  const [events, setEvents] = useState([]); // next 3 upcoming events
  const [jobs, setJobs] = useState([]); // 3 newest jobs
  const [alumniCount, setAlumniCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  // profile can be empty for a moment right after signup, so use "?." to be safe.
  const name = profile?.name || "there";
  const role = profile?.role || "";

  // Next 3 events: date is today or later, earliest first.
  useEffect(() => {
    const eventsQuery = query(
      collection(db, "events"),
      where("date", ">=", todayString()),
      orderBy("date"),
      limit(3)
    );
    const stop = onSnapshot(
      eventsQuery,
      (snapshot) => setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {} // if loading fails, the section just stays empty
    );
    return () => stop();
  }, []);

  // 3 newest jobs.
  useEffect(() => {
    const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(3));
    const stop = onSnapshot(
      jobsQuery,
      (snapshot) => setJobs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return () => stop();
  }, []);

  // Count alumni and students (ignoring users an admin removed).
  useEffect(() => {
    const stop = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const people = snapshot.docs.map((d) => d.data()).filter((u) => !u.removed);
        setAlumniCount(people.filter((u) => u.role === "alumni").length);
        setStudentCount(people.filter((u) => u.role === "student").length);
      },
      () => {}
    );
    return () => stop();
  }, []);

  // How many of the profile fields are filled in?
  const filled = PROFILE_FIELDS.filter((field) => profile?.[field]).length;
  const profileIncomplete = profile && filled < PROFILE_FIELDS.length;

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
      <View style={styles.welcome}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.hello}>Welcome back,</Text>
          <Text style={styles.name}>{name}</Text>
          {role ? <Text style={styles.role}>{role}</Text> : null}
        </View>
      </View>

      {/* Community numbers */}
      <View style={styles.statRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{alumniCount}</Text>
          <Text style={styles.statLabel}>Alumni</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentCount}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
      </View>

      {/* Only shown while the profile is incomplete. Tapping opens the Profile tab. */}
      {profileIncomplete ? (
        <TouchableOpacity style={styles.reminder} onPress={() => router.push("/profile")}>
          <View style={styles.reminderText}>
            <Text style={styles.reminderTitle}>Complete your profile</Text>
            <Text style={styles.reminderSub}>
              {filled} of {PROFILE_FIELDS.length} details added
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} />
        </TouchableOpacity>
      ) : null}

      {/* Upcoming events */}
      <SectionHeader title="Upcoming Events" onSeeAll={() => router.push("/events")} />
      {events.length === 0 ? (
        <Text style={styles.empty}>No upcoming events.</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.item}>
            <Text style={styles.itemTitle}>{event.title}</Text>
            <IconText icon="calendar-outline" text={formatDate(event.date)} />
            <IconText icon="location-outline" text={event.venue} />
            <Text style={styles.itemSub}>{(event.rsvps || []).length} going</Text>
          </View>
        ))
      )}

      {/* Latest jobs */}
      <SectionHeader title="Latest Jobs" onSeeAll={() => router.push("/jobs")} />
      {jobs.length === 0 ? (
        <Text style={styles.empty}>No jobs posted yet.</Text>
      ) : (
        jobs.map((job) => (
          <View key={job.id} style={styles.item}>
            <Text style={styles.itemTitle}>{job.title}</Text>
            <IconText icon="business-outline" text={job.company} />
            <Text style={styles.itemSub}>{job.type}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// A section title on the left and a "See all" link on the right.
function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  welcome: {
    flexDirection: "row", // avatar on the left, text on the right
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28, // half the width = a perfect circle
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.primary, fontSize: 26, fontWeight: "bold" },
  welcomeText: { flex: 1 },
  hello: { color: COLORS.primaryLight, fontSize: 14 },
  name: { color: COLORS.white, fontSize: 22, fontWeight: "bold" },
  role: { color: COLORS.primaryLight, fontSize: 13, textTransform: "capitalize", marginTop: 2 },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statBox: {
    flex: 1, // two equal boxes
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  statValue: { fontSize: 26, fontWeight: "bold", color: COLORS.primaryDark },
  statLabel: { fontSize: 13, color: COLORS.text, marginTop: 2 },
  reminder: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    marginBottom: 4,
  },
  reminderText: { flex: 1 },
  reminderTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.primaryDark },
  reminderSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.text },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: "bold" },
  empty: { color: COLORS.textMuted },
  item: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    marginBottom: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 2 },
  itemSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textTransform: "capitalize" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: "center",
  },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: "bold" },
});
