// app/(app)/(tabs)/directory.js
// The Alumni Directory: a list of all users whose role is "alumni".
// You can search by name, filter by branch and by graduation year,
// and tap a person to see their full profile.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { BRANCHES } from "../../../constants/branches";
import Chip from "../../../components/Chip";
import { COLORS } from "../../../constants/theme";

export default function DirectoryScreen() {
  const [alumni, setAlumni] = useState([]); // all alumni from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter values chosen by the user ("" means "All").
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");

  // Load alumni from Firestore once when the screen opens.
  useEffect(() => {
    // Ask Firestore for documents in "users" where role is "alumni".
    const alumniQuery = query(collection(db, "users"), where("role", "==", "alumni"));

    // onSnapshot keeps the list up to date automatically if anyone edits their profile.
    const stop = onSnapshot(
      alumniQuery,
      (snapshot) => {
        // Turn each Firestore document into a plain object, keeping its id.
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort alphabetically by name.
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setAlumni(list);
        setLoading(false);
      },
      () => {
        setError("Could not load alumni. Check your internet.");
        setLoading(false);
      }
    );

    return () => stop(); // stop listening when the screen closes
  }, []);

  // Build the list of graduation years that actually exist, e.g. ["2020", "2023"].
  const years = [];
  alumni.forEach((person) => {
    if (person.graduationYear && !years.includes(person.graduationYear)) {
      years.push(person.graduationYear);
    }
  });
  years.sort();

  // Apply search + filters to get the list we actually show.
  const filtered = alumni.filter((person) => {
    const nameMatches = (person.name || "").toLowerCase().includes(search.toLowerCase());
    const branchMatches = branch === "" || person.branch === branch;
    const yearMatches = year === "" || person.graduationYear === year;
    return nameMatches && branchMatches && yearMatches;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search box */}
      <TextInput
        style={styles.search}
        placeholder="Search by name..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Branch filter: a sideways-scrolling row of chips */}
      <Text style={styles.filterLabel}>Branch</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip label="All" selected={branch === ""} onPress={() => setBranch("")} />
        {BRANCHES.map((item) => (
          <Chip key={item} label={item} selected={branch === item} onPress={() => setBranch(item)} />
        ))}
      </ScrollView>

      {/* Year filter: only years that alumni have entered */}
      <Text style={styles.filterLabel}>Graduation Year</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip label="All" selected={year === ""} onPress={() => setYear("")} />
        {years.map((item) => (
          <Chip key={item} label={item} selected={year === item} onPress={() => setYear(item)} />
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* FlatList efficiently shows a long, scrollable list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No alumni found.</Text>}
        renderItem={({ item }) => (
          // Tapping a card opens app/(app)/alumni/[id].js with this person's id.
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/alumni/${item.id}`)}>
            <Text style={styles.name}>{item.name}</Text>
            {/* Only show job line if they filled in job title or company */}
            {item.jobTitle || item.company ? (
              <Text style={styles.job}>
                {item.jobTitle}
                {item.jobTitle && item.company ? " at " : ""}
                {item.company}
              </Text>
            ) : null}
            <Text style={styles.meta}>
              {item.branch || "Branch -"} • {item.graduationYear || "Year -"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 6 },
  chipRow: { flexGrow: 0, marginBottom: 12 }, // flexGrow: 0 stops the row from stretching
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
  name: { fontSize: 17, fontWeight: "bold" },
  job: { fontSize: 15, color: COLORS.text, marginTop: 2 },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
});
