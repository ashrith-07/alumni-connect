// app/(app)/_layout.js
// Layout for the logged-IN screens.
// 1. If nobody is logged in, send them to the login screen (this "protects" these screens).
// 2. Otherwise show a Stack containing:
//      - "(tabs)"         -> the bottom-tab screens (Home, Directory, Profile)
//      - "alumni/[id]"    -> one alumnus's details, which opens ON TOP of the tabs
//                            (with a back arrow to return to the list)
//      - "events/create"  -> the Create Event form (admins only), also on top of the tabs
//      - "jobs/create"    -> the Post a Job form (alumni only), also on top of the tabs
//      - "admin/users"    -> Manage Users (admins only), also on top of the tabs

import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/theme";

export default function AppLayout() {
  const { user, loading } = useAuth();

  // Still checking if someone is logged in -> show a spinner.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not logged in -> go to the login screen.
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Logged in -> show the screens.
  return (
    // screenOptions apply to every screen in this Stack:
    // blue back arrow, bold title.
    <Stack
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: "bold", color: COLORS.text },
      }}
    >
      {/* The tabs have their own header, so hide the Stack's header here */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="alumni/[id]" options={{ title: "Alumni Profile" }} />
      <Stack.Screen name="events/create" options={{ title: "Create Event" }} />
      <Stack.Screen name="jobs/create" options={{ title: "Post a Job" }} />
      <Stack.Screen name="admin/users" options={{ title: "Manage Users" }} />
    </Stack>
  );
}
