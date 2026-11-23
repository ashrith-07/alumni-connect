# Prompt History

Short, code-directed prompts used to build Alumni Connect with Claude Code, in order. Test on a phone (Expo Go) before moving to the next one.

## Setup

1. Write `CLAUDE.md`: Expo + Expo Router, JS only, Firebase Auth + Firestore. Simple code, short comments, one feature at a time, no commits or pushes by Claude.
2. Scaffold a blank Expo app with `expo-router`. Set `main` to `expo-router/entry` and add a `scheme` in `app.json`.
3. Install `firebase` and `@react-native-async-storage/async-storage`.
4. Create `firebaseConfig.js` that reads `EXPO_PUBLIC_` keys from `.env`. Export `auth` (with `getReactNativePersistence`) and `db`.
5. Add `.env` to `.gitignore` and create `.env.example`.

## Auth

6. Create `context/AuthContext.js` with `onAuthStateChanged`. Expose `user`, `profile` and `loading` through a `useAuth()` hook.
7. Add route groups `app/(auth)` and `app/(app)`. Redirect with `<Redirect>` based on `user`.
8. Build `(auth)/signup.js` using `createUserWithEmailAndPassword`. Save `{ name, email, role }` to `users/{uid}` with `setDoc`.
9. Build `(auth)/login.js` using `signInWithEmailAndPassword`.
10. Add `utils/authErrors.js` to map Firebase error codes to friendly messages.
11. Use `onSnapshot` on `users/{uid}` so `profile` updates live.

## Profile

12. Add `(tabs)/profile.js` with a view mode and an edit mode.
13. Save edits with `setDoc(..., { merge: true })`. Fields: graduationYear, branch, company, jobTitle, phone, linkedin.
14. Validate: name required, year must match `/^\d{4}$/`.
15. Add `constants/branches.js` and render branch as selectable chips.
16. Add `utils/openLink.js` using `Linking.openURL`.

## Directory

17. Convert `(app)/(tabs)` to bottom tabs with `Tabs` from `expo-router/tabs`.
18. Add `(tabs)/directory.js`. Query `users` with `where("role", "==", "alumni")` and `onSnapshot`. Render with `FlatList`.
19. Add a name search and branch/year filters with `Array.filter`.
20. Extract `components/Chip.js` and `components/InfoRow.js`.
21. Add the dynamic route `(app)/alumni/[id].js`. Read the id with `useLocalSearchParams` and load it with `getDoc`.

## Events

22. Add `(tabs)/events.js`. Query `events` with `orderBy("date")` and `onSnapshot`.
23. Add `(app)/events/create.js` with `addDoc`. Only show it when `profile.role === "admin"`.
24. Store `date` as a `YYYY-MM-DD` string. Add `utils/formatDate.js` with `isValidDate` and `formatDate`.
25. Add RSVP using an `rsvps` array of uids. Use `arrayUnion` and `arrayRemove`. Show the count from `rsvps.length`.

## Jobs

26. Add `(tabs)/jobs.js`. Query `jobs` with `orderBy("createdAt", "desc")`.
27. Add `(app)/jobs/create.js` with `addDoc`, `serverTimestamp`, `postedBy` and `postedByName`. Only for `role === "alumni"`.
28. Add an Apply button that calls `openLink`.

## Security and polish

29. Write `firestore.rules` with helpers `signedIn()` and `myRole()`. Rules: own profile only, admin-only events, alumni-only jobs, RSVP limited to your own uid with `affectedKeys().hasOnly(["rsvps"])`.
30. Add `constants/theme.js` with a `COLORS` object. Replace every hard-coded colour with it.
31. Add `ActivityIndicator` loading states and `error` state messages to every screen that loads data.
32. Style the Stack and Tabs headers with `screenOptions`. Confirm logout with `Alert.alert`.
33. Write `README.md`: features, tech stack, structure, Firestore collections, setup steps.

## Admin dashboard

34. Add `(tabs)/admin.js`. Hide the tab for non-admins with `href: null`.
35. Compute stats from the `users` snapshot: counts by role, by `graduationYear` and by `branch`. Draw bars with plain `View` widths.
36. Query upcoming events with `where("date", ">=", todayString())`.
37. Add `(app)/admin/users.js` with search and a role filter.
38. Add `verified` and `removed` flags. Toggle them with `updateDoc`. Add `components/VerifiedBadge.js`.
39. In `AuthContext`, call `signOut` when `profile.removed` is true. Hide removed users from the Directory.
40. Update `firestore.rules`: admins may only change `verified` and `removed`. Users can't change their own `role`, `verified` or `removed`. Add an `isActive()` check.
41. Add `utils/exportCsv.js`: build the CSV text, write it with `File` from `expo-file-system`, and share it with `expo-sharing`.

## Final polish

42. Install `@expo/vector-icons`. Replace every emoji with `Ionicons`, using filled icons for the active tab and outline icons for the rest.
43. Add `components/IconText.js` for icon + text rows.
