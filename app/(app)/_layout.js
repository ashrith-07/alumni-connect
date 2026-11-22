// app/(app)/_layout.js
// Layout for the logged-IN screens.
// 1. If nobody is logged in, send them to the login screen (this "protects" these screens).
// 2. Otherwise show a Stack containing:
//      - "(tabs)"         -> the bottom-tab screens (Home, Directory, Profile)
//      - "alumni/[id]"    -> one alumnus's details, which opens ON TOP of the tabs
//                            (with a back arrow to return to the list)

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

  // Logged in -> show the screens.
  return (
    <Stack>
      {/* The tabs have their own header, so hide the Stack's header here */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="alumni/[id]" options={{ title: "Alumni Profile" }} />
    </Stack>
  );
}
