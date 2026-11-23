// app/(app)/(tabs)/_layout.js
// Creates the BOTTOM TAB BAR. Each <Tabs.Screen> is one tab.
// "name" must match a file in this folder:
//   index.js -> Home, directory.js -> Directory, events.js -> Events,
//   jobs.js -> Jobs, profile.js -> Profile, admin.js -> Admin (admins only)
// Icons come from Ionicons (part of @expo/vector-icons).

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import { COLORS } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";

// Builds the icon for one tab.
// The tab bar tells us the colour and size, and whether the tab is selected ("focused").
// Selected tab -> filled icon (e.g. "home"); other tabs -> outline icon (e.g. "home-outline").
function tabIcon(name) {
  return ({ color, size, focused }) => (
    <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
  );
}

export default function TabsLayout() {
  // Check if the logged-in user is an admin (to show/hide the Admin tab).
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    // screenOptions apply to every tab: blue for the selected tab,
    // grey for the others, and a bold title in the top bar.
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerTitleStyle: { fontWeight: "bold", color: COLORS.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen
        name="directory"
        options={{ title: "Directory", tabBarIcon: tabIcon("people") }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: "Events", tabBarIcon: tabIcon("calendar") }}
      />
      <Tabs.Screen
        name="jobs"
        options={{ title: "Jobs", tabBarIcon: tabIcon("briefcase") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "My Profile", tabBarIcon: tabIcon("person") }}
      />
      {/* Admin tab: "href: null" HIDES the tab, so only admins see it */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: tabIcon("stats-chart"),
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
