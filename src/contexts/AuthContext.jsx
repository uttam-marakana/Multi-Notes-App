import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  const timeoutRef = useRef(null);

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

  const clearProtectedSession = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("noteflow-protected-access");
    }
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      clearProtectedSession();
    }, 300000); // 5 minutes
  }, [clearProtectedSession]);

  // ✅ AUTO AUTH STATE SYNC
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          clearProtectedSession();
          const profile = await buildUserProfile(user);
          setCurrentUser(profile);
        } else {
          clearProtectedSession();
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [buildUserProfile, clearProtectedSession]);

  // ✅ IDLE TIMEOUT LOGIC
  useEffect(() => {
    if (!currentUser) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const reset = () => resetTimeout();

    events.forEach((event) => window.addEventListener(event, reset));
    resetTimeout(); // Start the timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentUser, resetTimeout]);

  // ✅ SIGNUP
  const signUp = async (email, password, userDetails = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      clearProtectedSession();
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

      return userCredential; // ✅ IMPORTANT (fixes your bug)
    } catch (error) {
      console.error("SignUp Error:", error.message);
      throw error;
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      // Client-side validation
      if (!email?.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (!password) {
        throw new Error("Please enter your password.");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      clearProtectedSession();

      return userCredential;
    } catch (error) {
      console.error("Login Error:", error);

      let message = "Unable to sign in. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/wrong-password":
        case "auth/user-not-found":
        case "auth/invalid-credential":
          message = "Incorrect email or password. Please try again.";
          break;

        case "auth/user-disabled":
          message = "This account has been disabled. Please contact support.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many unsuccessful login attempts. Please try again later.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection and try again.";
          break;

        case "auth/operation-not-allowed":
          message = "Email and password login is currently unavailable.";
          break;

        case "auth/invalid-api-key":
          message =
            "Authentication is currently unavailable. Please try again later.";
          break;

        default:
          // Keep custom validation messages
          if (
            error.message === "Please enter your email address." ||
            error.message === "Please enter your password."
          ) {
            message = error.message;
          }
          break;
      }

      throw new Error(message);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      clearProtectedSession();
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
