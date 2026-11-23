// components/Chip.js
// A small rounded button used for filters (e.g. "CSE", "2023").
// When "selected" is true it is filled blue, otherwise it is just outlined.

import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.selected]} onPress={onPress}>
      <Text style={selected ? styles.textSelected : styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  selected: { backgroundColor: COLORS.primary },
  text: { color: COLORS.primary },
  textSelected: { color: COLORS.white },
});
