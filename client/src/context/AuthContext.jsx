// Auth Context — Provides authentication state and methods to the entire app
import { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "../services/api";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            photoURL: firebaseUser.photoURL,
          });
          // Sync user profile to backend
          try {
            await api.post("/users/sync");
          } catch (err) {
            console.error("Failed to sync user:", err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn("Auth state tracking disabled: Firebase not configured");
      setLoading(false);
    }
    return unsubscribe;
  }, []);

  // Email/password signup
  async function signup(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred.user;
  }

  // Email/password login
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // Google sign in
  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  }

  // Logout
  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
