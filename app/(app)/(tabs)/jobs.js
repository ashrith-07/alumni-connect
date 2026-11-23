// app/(app)/(tabs)/jobs.js
// The Jobs tab: shows all job and internship posts (newest first).
// - Everyone can view posts and tap "Apply" to open the apply link.
// - Only alumni see the "+ Post a Job" button.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { openLink } from "../../../utils/openLink";
import { COLORS } from "../../../constants/theme";
import IconText from "../../../components/IconText";

export default function JobsScreen() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only alumni can post jobs.
  const isAlumni = profile?.role === "alumni";

  // Load jobs from Firestore, newest first ("desc" = descending).
  useEffect(() => {
    const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const stop = onSnapshot(
      jobsQuery,
      (snapshot) => {
        setJobs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setError("Could not load jobs. Check your internet.");
        setLoading(false);
      }
    );
    return () => stop();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Only alumni see this button */}
      {isAlumni ? (
        <TouchableOpacity style={styles.postButton} onPress={() => router.push("/jobs/create")}>
          <Text style={styles.postText}>+ Post a Job</Text>
        </TouchableOpacity>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No jobs posted yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Small label: "Job" or "Internship" */}
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <IconText icon="business-outline" text={item.company} />
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.postedBy}>Posted by {item.postedByName}</Text>

            <TouchableOpacity style={styles.applyButton} onPress={() => openLink(item.applyLink)}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
  postButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  postText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
  error: { color: COLORS.danger, marginBottom: 12 },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 24 },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: COLORS.card,
  },
  type: {
    alignSelf: "flex-start", // label only as wide as its text
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 15, color: COLORS.text, marginTop: 8 },
  postedBy: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  applyButton: {
    backgroundColor: COLORS.success,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  applyText: { color: COLORS.white, fontWeight: "bold" },
});
