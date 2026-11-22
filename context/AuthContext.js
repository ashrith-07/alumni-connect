// context/AuthContext.js
// This file keeps track of WHO is logged in, and shares that with every screen.
// A "Context" in React is like a noticeboard: one place writes the info,
// and any screen can read it using useAuth().

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// Create the empty "noticeboard".
const AuthContext = createContext(null);

// AuthProvider wraps the whole app (see app/_layout.js) so every screen can use it.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // the Firebase login (email, uid)
  const [profile, setProfile] = useState(null); // our extra data from Firestore (name, role)
  const [loading, setLoading] = useState(true); // true while we are still checking

  // useEffect with [] runs ONCE when the app starts.
  useEffect(() => {
    let stopProfile = null; // used to stop listening to the old user's data

    // Firebase calls this function when the app opens, and every time
    // someone logs in or logs out.
    const stopAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Stop listening to the previous user's profile (if any).
      if (stopProfile) {
        stopProfile();
        stopProfile = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Someone is logged in: listen to their document in the "users" collection.
        // onSnapshot updates "profile" automatically whenever that document changes.
        const userDoc = doc(db, "users", firebaseUser.uid);
        stopProfile = onSnapshot(
          userDoc,
          (snapshot) => {
            setProfile(snapshot.exists() ? snapshot.data() : null);
          },
          () => setProfile(null) // if reading fails, just show no profile
        );
      } else {
        // Nobody is logged in.
        setProfile(null);
      }

      // We now know the login state, so stop showing the loading spinner.
      setLoading(false);
    });

    // Clean up the listeners when the app closes.
    return () => {
      stopAuth();
      if (stopProfile) stopProfile();
    };
  }, []);

  // Put user, profile and loading on the "noticeboard".
  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Any screen can call useAuth() to read user, profile and loading.
export function useAuth() {
  return useContext(AuthContext);
}
