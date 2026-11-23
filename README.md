# Alumni Connect

A mobile app that connects a college's alumni and students. Alumni can build a profile and post jobs, students can find alumni, everyone can RSVP to events, and admins manage the community from a dashboard.

Built with **Expo (React Native)** and **Firebase**, in plain JavaScript.

## Features

### For everyone
- **Sign up / log in / log out** with email and password. Choose a role (student or alumni) at sign up. You stay logged in after closing the app.
- **Profile**: view and edit name, graduation year, branch, company, job title, phone and LinkedIn URL.
- **Alumni Directory**: search by name, filter by branch and graduation year, tap a person to see their full profile. Verified alumni show a green badge.
- **Events**: see upcoming events (title, description, date, venue), RSVP or cancel, and see how many people are going.
- **Jobs board**: browse jobs and internships and tap **Apply** to open the link.

### For alumni
- **Post jobs and internships** (title, company, description, apply link).

### For admins
- **Create events.**
- **Admin Dashboard**:
  - Stats: total alumni, total students, verified alumni, upcoming events.
  - Alumni counts by graduation year and by branch (bar charts).
  - **Manage Users**: view all users, **verify** alumni (adds a badge), **remove / restore** users.
  - **Export alumni data as a CSV file** and share it (WhatsApp, Gmail, Drive...).

### Security
- Firestore security rules (in `firestore.rules`) make sure that:
  - you can only edit your own profile, and never change your own role;
  - only admins create events, and others can only add or remove their own RSVP;
  - only alumni post jobs, and only the poster can edit or delete them;
  - only admins can verify or remove users;
  - removed users are blocked from changing anything.

## Tech stack

| Part | Technology |
|---|---|
| App framework | Expo (React Native) |
| Navigation | Expo Router (file-based routing, bottom tabs) |
| Language | JavaScript (no TypeScript) |
| Login | Firebase Authentication (email / password) |
| Database | Cloud Firestore |
| Saving the login on the phone | AsyncStorage |
| CSV export | expo-file-system and expo-sharing |
| Icons | @expo/vector-icons (Ionicons) |

## Project structure

```
app/
  _layout.js            Wraps the whole app with login info
  (auth)/               Logged-out screens: login, signup
  (app)/                Logged-in screens
    (tabs)/             Bottom tabs: Home, Directory, Events, Jobs, Profile, Admin
    alumni/[id].js      One alumnus's profile
    events/create.js    Create event (admins)
    jobs/create.js      Post a job (alumni)
    admin/users.js      Manage users (admins)
components/             Reusable pieces (Chip, InfoRow, VerifiedBadge)
constants/              Colour theme and branch list
context/AuthContext.js  Keeps track of who is logged in
utils/                  Helpers (dates, CSV export, error messages, links)
firebaseConfig.js       Connects the app to Firebase
firestore.rules         Database security rules
```

## Database (Firestore)

| Collection | What each document holds |
|---|---|
| `users` | name, email, role (`student` / `alumni` / `admin`), graduationYear, branch, company, jobTitle, phone, linkedin, verified, removed |
| `events` | title, description, date (`YYYY-MM-DD`), venue, rsvps (list of user ids), createdBy |
| `jobs` | type (Job / Internship), title, company, description, applyLink, postedBy, postedByName, createdAt |

## Setup

You need **Node.js (LTS)**, **Git**, and the **Expo Go** app on your phone.

1. **Get the code**
   ```
   git clone https://github.com/ashrith-07/alumni-connect.git
   cd alumni-connect
   npm install
   ```
2. **Create a Firebase project** at https://console.firebase.google.com
   - Add a **Web app** to get your config keys.
   - Turn on **Authentication -> Sign-in method -> Email/Password**.
   - Create a **Firestore Database**.
3. **Add your keys.** Copy `.env.example` to a new file named `.env` and paste your Firebase values after each `=`.
4. **Publish the security rules.** Copy everything in `firestore.rules` into **Firestore Database -> Rules** in the Firebase Console and click **Publish**.
5. **Run the app**
   ```
   npx expo start
   ```
   Scan the QR code with your phone camera (iPhone) or the Expo Go app (Android). The phone and computer must be on the same Wi-Fi. If that fails, use `npx expo start --tunnel`.
6. **Make an admin.** Sign up in the app, then in Firebase Console go to **Firestore Database -> users -> (your document)**, edit the `role` field and change it to `admin`.

## Future scope
- Push notifications for new events and jobs.
- Permanently deleting user logins (needs Firebase Cloud Functions).
- Profile photos and in-app messaging between alumni and students.
