// utils/openLink.js
// Opens a web link (like a LinkedIn URL) in the phone's browser.

import { Linking } from "react-native";

export function openLink(url) {
  // Add "https://" if it is missing, so the phone knows it's a web link.
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }
  Linking.openURL(url);
}
