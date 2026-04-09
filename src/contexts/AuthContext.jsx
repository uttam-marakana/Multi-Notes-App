import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ AUTO AUTH STATE SYNC
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...docSnap.data(),
            });
          } else {
            // fallback (rare case)
            setCurrentUser({
              uid: user.uid,
              email: user.email,
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ SIGNUP
  const signUp = async (email, password, userDetails = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      // 🔥 Store in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        ...userDetails,
      });

      console.log("User registered + stored in Firestore");

      return userCredential; // ✅ IMPORTANT (fixes your bug)
    } catch (error) {
      console.error("SignUp Error:", error.message);
      throw error;
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      return userCredential; // ✅ consistent return
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout Error:", error.message);
      throw error;
    }
  };

  // ✅ MANUAL REFRESH (optional but powerful)
  const refreshCurrentUser = async () => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCurrentUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          ...docSnap.data(),
        });
      }
    } catch (error) {
      console.error("Refresh Error:", error.message);
    }
  };

  const value = {
    currentUser,
    signUp,
    login,
    logout,
    loading,
    refreshCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
