# Alumni Connect – Project Rules for Claude

## About the project
- An **Alumni Management mobile app**.
- Built with **Expo (React Native)**, **Expo Router** for navigation, **JavaScript only (NO TypeScript)**, and **Firebase** (Auth + Firestore).
- GitHub repo: https://github.com/ashrith-07/alumni-connect.git
- Firebase keys live in a `.env` file using the `EXPO_PUBLIC_` prefix. `.env` is never committed; `.env.example` is.

## About me (the developer)
- I am a **complete beginner** in mobile app development and Firebase.
- I must **explain all of this code in a viva**, so I need to understand every line.
- I do not know how to test a mobile app yet. Tell me exactly how to test each feature on my phone (Expo Go).

## Coding rules
1. **Keep code simple and readable.** Prefer the plain, obvious way over clever tricks or advanced patterns.
2. **Add short comments** explaining what each part of the code does.
3. **Never add libraries unless truly necessary.** If one is needed, explain why before adding it.
4. **JavaScript only** – `.js` files, no TypeScript, no type annotations.
5. **Work on one feature at a time.** Do not start the next feature until I confirm the current one works.

## After every change
- **Explain every change in plain English**: which files changed, what each one does, and why.
- Tell me **how to test it** on my phone, step by step.

## Anything outside the code
Whenever I need to do something myself (Firebase Console, Expo Go, terminal commands, GitHub, pasting keys into `.env`, etc.):
- Give **clear, numbered, step-by-step instructions**.
- Say exactly **what to click, what to type, and what I should see** when it worked.
- Assume I have never used that tool before.

## Git rules
- **Claude must NOT run `git commit` or `git push`.** I do that myself.
- After each feature works, give me **one single-line commit message** using conventional commits:
  - `feat:` new feature
  - `fix:` bug fix
  - `chore:` setup, config, dependencies
  - `docs:` documentation / README
  - `style:` UI / formatting changes only
- Also give me the exact commands to run, e.g.:
  ```
  git add .
  git commit -m "feat: add login screen"
  git push
  ```
- **Never one giant commit.** One commit per feature or meaningful step.

## Build plan (one phase at a time)
1. **Setup** – Expo + Expo Router project, Firebase connected via `.env`, `.env.example`, `.gitignore`, connect to GitHub.
2. **Login** – Sign up (name + role: alumni/student), login, logout with Firebase Auth email/password. Save users in Firestore `users` collection. Stay logged in. Redirect logged-out users to login.
3. **Profile** – View/edit name, graduation year, branch, company, job title, phone, LinkedIn URL. Save to Firestore.
4. **Directory** – Bottom tab navigation. List all alumni, search by name, filter by branch and graduation year, tap to view profile.
5. **Events** – Admins create events (title, description, date, venue). Everyone views and RSVPs. Show RSVP count. `admin` role set manually in Firestore.
6. **Jobs board** – Alumni post jobs/internships (title, company, description, apply link). Everyone can view.
7. **Security & polish** – Firestore security rules (edit own profile only, only admins create events, only alumni post jobs). Consistent color theme, loading indicators, error messages. README with features, tech stack, setup steps, screenshot placeholders.

**Out of scope:** push notifications (call it "future scope" in the viva).

## Viva help
When I ask, explain what was just built as if I've never coded before, walk through each changed file, then ask me 3 viva questions and check my answers.
