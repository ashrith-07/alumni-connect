// components/InfoRow.js
// A small reusable piece that shows one "label + value" row, e.g.
//   Company
//   Google
// If "onPress" is given, the value is shown as a blue link that can be tapped.
// Used by the Profile screen and the Alumni details screen.

import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function InfoRow({ label, value, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {value && onPress ? (
        <Text style={styles.link} onPress={onPress}>
          {value}
        </Text>
      ) : (
        <Text style={styles.value}>{value || "-"}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  label: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  value: { fontSize: 16 },
  link: { fontSize: 16, color: COLORS.primary, textDecorationLine: "underline" },
});
