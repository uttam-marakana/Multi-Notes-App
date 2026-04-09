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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userData,
            });
          } else {
            console.warn("User document not found in Firestore.");
            setCurrentUser({
              uid: user.uid,
              email: user.email,
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user details:", error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, userDetails) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        ...userDetails,
      });

      console.log("User registered and details saved to Firestore");
      return user;
    } catch (error) {
      console.error("Error during sign-up:", error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error) {
      console.error("Error during login:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log("User logged out");
    } catch (error) {
      console.error("Error during logout:", error.message);
      throw error;
    }
  };

  const refreshCurrentUser = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setCurrentUser({
            ...auth.currentUser,
            ...userDoc.data(),
          });
        } else {
          setCurrentUser(auth.currentUser);
        }
      } catch (error) {
        console.error("Error refreshing user details:", error.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signUp,
        login,
        logout,
        loading,
        refreshCurrentUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
