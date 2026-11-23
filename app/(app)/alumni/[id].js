// app/(app)/alumni/[id].js
// Shows ONE alumnus's full profile (read-only).
// The [id] in the file name is a "dynamic route": opening "/alumni/abc123"
// shows this screen with id = "abc123" (that user's Firestore document id).

import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import InfoRow from "../../../components/InfoRow";
import { openLink } from "../../../utils/openLink";
import { COLORS } from "../../../constants/theme";

export default function AlumniDetailScreen() {
  // Read the id from the URL.
  const { id } = useLocalSearchParams();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load this person's document from Firestore when the screen opens.
  useEffect(() => {
    async function loadPerson() {
      try {
        const snapshot = await getDoc(doc(db, "users", id));
        if (snapshot.exists()) {
          setPerson(snapshot.data());
        } else {
          setError("This profile does not exist.");
        }
      } catch (err) {
        setError("Could not load profile. Check your internet.");
      }
      setLoading(false);
    }
    loadPerson();
  }, [id]); // run again if the id changes

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{person.name}</Text>
      <Text style={styles.role}>{person.role}</Text>

      <InfoRow label="Email" value={person.email} />
      <InfoRow label="Graduation Year" value={person.graduationYear} />
      <InfoRow label="Branch" value={person.branch} />
      <InfoRow label="Company" value={person.company} />
      <InfoRow label="Job Title" value={person.jobTitle} />
      <InfoRow label="Phone" value={person.phone} />
      <InfoRow
        label="LinkedIn"
        value={person.linkedin}
        onPress={() => openLink(person.linkedin)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  container: { padding: 24, backgroundColor: COLORS.white, flexGrow: 1 },
  name: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  role: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
    textTransform: "capitalize",
    marginBottom: 16,
  },
  error: { color: COLORS.danger, fontSize: 16, textAlign: "center" },
});
