// app/(auth)/_layout.js
// Layout for the logged-OUT screens (login and signup).
// If the user is ALREADY logged in, send them to the home screen instead.

import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/theme";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // Still checking if someone is logged in -> show a spinner.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Already logged in -> go to the home screen ("/").
  if (user) {
    return <Redirect href="/" />;
  }

  // Not logged in -> show login/signup screens (no top header bar).
  return <Stack screenOptions={{ headerShown: false }} />;
}
