// components/VerifiedBadge.js
// A small green "✓ Verified" label, shown next to alumni that an admin has verified.

import { Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function VerifiedBadge() {
  return <Text style={styles.badge}>✓ Verified</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start", // only as wide as the text
    backgroundColor: COLORS.success,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden", // needed on iPhone so the rounded corners show
  },
});
