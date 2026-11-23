// app/(app)/(tabs)/_layout.js
// Creates the BOTTOM TAB BAR. Each <Tabs.Screen> is one tab.
// "name" must match a file in this folder:
//   index.js -> Home, directory.js -> Directory, events.js -> Events,
//   jobs.js -> Jobs, profile.js -> Profile
// We use emoji as icons so we don't need an extra icon library.

import { Text } from "react-native";
import { Tabs } from "expo-router/tabs";
import { COLORS } from "../../../constants/theme";

// Small helper that turns an emoji into a tab icon.
function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
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
        options={{ title: "Home", tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="directory"
        options={{ title: "Directory", tabBarIcon: () => <TabIcon emoji="👥" /> }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: "Events", tabBarIcon: () => <TabIcon emoji="📅" /> }}
      />
      <Tabs.Screen
        name="jobs"
        options={{ title: "Jobs", tabBarIcon: () => <TabIcon emoji="💼" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "My Profile", tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}
