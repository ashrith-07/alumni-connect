// components/IconText.js
// Shows a small icon followed by text on one line, e.g.  [calendar icon] Tue Dec 15 2026
// Used for event dates/venues and job companies.
// Icons come from Ionicons (part of @expo/vector-icons). Browse all names at https://icons.expo.fyi

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

export default function IconText({ icon, text }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={15} color={COLORS.textMuted} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }, // icon and text side by side
  text: { fontSize: 14, color: COLORS.text },
});
