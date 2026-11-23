// components/AppInput.js
// Our own text box. It works exactly like React Native's <TextInput>,
// but ALWAYS sets the text colour, placeholder colour and cursor colour.
// Why: if we don't, Android uses the phone's theme. In dark mode that gives
// white text on our white background, so typed text becomes invisible.

import { TextInput } from "react-native";
import { COLORS } from "../constants/theme";

export default function AppInput({ style, ...props }) {
  return (
    <TextInput
      {...props} // pass along everything else (value, onChangeText, placeholder...)
      style={[{ color: COLORS.text }, style]} // our colour first, the screen's own style on top
      placeholderTextColor={COLORS.textMuted}
      selectionColor={COLORS.primary}
    />
  );
}
