// app/(app)/(tabs)/_layout.js
// Creates the BOTTOM TAB BAR. Each <Tabs.Screen> is one tab.
// "name" must match a file in this folder:
//   index.js -> Home tab, directory.js -> Directory tab, profile.js -> Profile tab
// We use emoji as icons so we don't need an extra icon library.

import { Text } from "react-native";
import { Tabs } from "expo-router/tabs";

// Small helper that turns an emoji into a tab icon.
function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2563eb" }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="directory"
        options={{ title: "Directory", tabBarIcon: () => <TabIcon emoji="👥" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "My Profile", tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}
