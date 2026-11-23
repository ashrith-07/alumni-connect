// components/VerifiedBadge.js
// A small green "Verified" label with a tick icon,
// shown next to alumni that an admin has verified.

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

export default function VerifiedBadge() {
  return (
    <View style={styles.badge}>
      <Ionicons name="checkmark-circle" size={13} color={COLORS.white} />
      <Text style={styles.text}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", // icon and text side by side
    alignItems: "center",
    alignSelf: "flex-start", // only as wide as its content
    gap: 4,
    backgroundColor: COLORS.success,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  text: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
});
