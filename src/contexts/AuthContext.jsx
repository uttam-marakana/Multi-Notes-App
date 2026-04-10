import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, db } from "../config/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildUserProfile = useCallback(async (user) => {
    if (!user) return null;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        uid: user.uid,
        email: user.email,
      };
    }

    return {
      uid: user.uid,
      email: user.email,
      ...docSnap.data(),
    };
  }, []);

  // ✅ AUTO AUTH STATE SYNC
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await buildUserProfile(user);
          setCurrentUser(profile);
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
  }, [buildUserProfile]);

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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...userDetails,
      });

      setCurrentUser({
        uid: user.uid,
        email: user.email,
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
      const profile = await buildUserProfile(auth.currentUser);
      setCurrentUser(profile);
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
