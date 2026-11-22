// app/(app)/_layout.js
// Layout for the logged-IN screens.
// If nobody is logged in, send them to the login screen. This "protects" these screens.

import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user, loading } = useAuth();

  // Still checking if someone is logged in -> show a spinner.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Not logged in -> go to the login screen.
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Logged in -> show the requested screen.
  return <Stack />;
}
