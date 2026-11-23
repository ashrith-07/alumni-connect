// app/(app)/(tabs)/events.js
// The Events tab: shows all events (earliest date first).
// - Everyone can RSVP (tap again to cancel) and see how many people are going.
// - Admins also see a "+ Create Event" button.

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
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../../context/AuthContext";
import { formatDate } from "../../../utils/formatDate";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import IconText from "../../../components/IconText";

export default function EventsScreen() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only admins can create events. The role is set manually in Firestore.
  const isAdmin = profile?.role === "admin";

  // Load events from Firestore, sorted by date (earliest first).
  // onSnapshot keeps the list (and RSVP counts) updated live.
  useEffect(() => {
    const eventsQuery = query(collection(db, "events"), orderBy("date"));
    const stop = onSnapshot(
      eventsQuery,
      (snapshot) => {
        setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setError("Could not load events. Check your internet.");
        setLoading(false);
      }
    );
    return () => stop();
  }, []);

  // RSVP or cancel RSVP for one event.
  // Each event has an "rsvps" list containing the uids of people going.
  async function toggleRsvp(event) {
    setError("");
    const eventRef = doc(db, "events", event.id);
    const alreadyGoing = (event.rsvps || []).includes(user.uid);
    try {
      if (alreadyGoing) {
        // arrayRemove takes our uid OUT of the list.
        await updateDoc(eventRef, { rsvps: arrayRemove(user.uid) });
      } else {
        // arrayUnion adds our uid to the list (never twice).
        await updateDoc(eventRef, { rsvps: arrayUnion(user.uid) });
      }
    } catch (err) {
      setError("Could not update RSVP. Please try again.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Only admins see this button */}
      {isAdmin ? (
        <TouchableOpacity style={styles.createButton} onPress={() => router.push("/events/create")}>
          <Text style={styles.createText}>+ Create Event</Text>
        </TouchableOpacity>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No events yet.</Text>}
        renderItem={({ item }) => {
          const rsvps = item.rsvps || [];
          const going = rsvps.includes(user.uid); // has the current user RSVP'd?

          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <IconText icon="calendar-outline" text={formatDate(item.date)} />
              <IconText icon="location-outline" text={item.venue} />
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.footer}>
                <Text style={styles.count}>{rsvps.length} going</Text>

                {/* Blue "RSVP" if not going, green "Going" with a tick if going */}
                <TouchableOpacity
                  style={[styles.rsvpButton, going && styles.goingButton]}
                  onPress={() => toggleRsvp(item)}
                >
                  {going ? <Ionicons name="checkmark" size={16} color={COLORS.white} /> : null}
                  <Text style={styles.rsvpText}>{going ? "Going" : "RSVP"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  createText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
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
  title: { color: COLORS.text, fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  description: { fontSize: 15, color: COLORS.text, marginTop: 8 },
  footer: {
    flexDirection: "row", // put count and button side by side
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  count: { fontSize: 14, color: COLORS.textMuted },
  rsvpButton: {
    flexDirection: "row", // tick icon and text side by side
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  goingButton: { backgroundColor: COLORS.success },
  rsvpText: { color: COLORS.white, fontWeight: "bold" },
});
