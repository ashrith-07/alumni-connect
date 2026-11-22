// components/Chip.js
// A small rounded button used for filters (e.g. "CSE", "2023").
// When "selected" is true it is filled blue, otherwise it is just outlined.

import { TouchableOpacity, Text, StyleSheet } from "react-native";

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
    borderColor: "#2563eb",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  selected: { backgroundColor: "#2563eb" },
  text: { color: "#2563eb" },
  textSelected: { color: "#fff" },
});
