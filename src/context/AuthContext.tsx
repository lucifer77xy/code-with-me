"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Profile, Workspace } from "@/types";
import { INITIAL_PROFILES } from "@/data/initialData";
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  subscribeUserProfiles,
  saveUserProfile,
  getOrCreateWorkspace,
  updateUserPresence,
  DEFAULT_WORKSPACE_ID,
} from "@/lib/firestoreService";
import { toast } from "sonner";

export const getFirebaseAuthErrorMessage = (error: any): string => {
  const code = error?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password. Please check your credentials.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Sign-in attempt was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/unauthorized-domain":
      return "Domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains).";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Console. Please enable Email/Password or OAuth.";
    case "auth/too-many-requests":
      return "Access temporarily blocked due to many attempts. Reset password or try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return error?.message || "Authentication failed. Please try again.";
  }
};

interface AuthContextType {
  currentUser: Profile;
  partnerUser: Profile;
  allProfiles: Profile[];
  workspace: Workspace | null;
  switchUser: (userId?: string) => void;
  updateProfile: (updated: Partial<Profile>, profileId?: string) => Promise<void>;
  isFirebaseActive: boolean;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithGitHub: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
    partnerLabel?: string
  ) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeProfiles = (loadedProfiles: Profile[]): Profile[] =>
  loadedProfiles.map((profile, index) => ({
    ...profile,
    avatar_url: profile.avatar_url || (index === 0 ? "/boy-profile.jpg" : "/girl-profile.jpg"),
  }));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [activeUserId, setActiveUserId] = useState<string>(INITIAL_PROFILES[0].id);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isFirebaseActive = isFirebaseConfigured();

  // 1. Listen for Firestore User Profiles
  useEffect(() => {
    if (!isFirebaseActive) {
      setIsLoading(false);
      return;
    }

    const unsubProfiles = subscribeUserProfiles((firestoreProfiles) => {
      if (firestoreProfiles && firestoreProfiles.length > 0) {
        setProfiles((prev) => {
          // Merge firestore profiles into current state
          const updated = [...prev];
          firestoreProfiles.forEach((fp) => {
            const index = updated.findIndex((p) => p.id === fp.id || (p.email && p.email.toLowerCase() === fp.email.toLowerCase()));
            if (index >= 0) {
              updated[index] = { ...updated[index], ...fp };
            } else {
              updated.push(fp);
            }
          });
          return normalizeProfiles(updated);
        });
      }
    });

    return () => unsubProfiles();
  }, [isFirebaseActive]);

  // 2. Listen for Firebase Auth State Changes
  useEffect(() => {
    if (!isFirebaseActive) {
      setIsLoading(false);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Map or upsert Firebase user into couple profiles
        const matchedProfileIndex = profiles.findIndex(
          (p) => (p.email && p.email.toLowerCase() === user.email?.toLowerCase()) || p.id === user.uid
        );

        let userProfile: Profile;
        if (matchedProfileIndex >= 0) {
          userProfile = {
            ...profiles[matchedProfileIndex],
            id: user.uid,
            email: user.email || profiles[matchedProfileIndex].email,
            name: user.displayName || profiles[matchedProfileIndex].name,
            avatar_url: user.photoURL || profiles[matchedProfileIndex].avatar_url,
          };
        } else {
          userProfile = {
            id: user.uid,
            email: user.email || "partner@codetogether.love",
            name: user.displayName || "Code Partner",
            partner_label: "Partner",
            avatar_url: user.photoURL || "/boy-profile.jpg",
            motto: "Building our dream stack together ✨",
            theme_color: "violet",
            current_streak: 1,
            total_hours: 0,
            problems_solved: 0,
            is_coding_now: false,
          };
        }

        setActiveUserId(userProfile.id);
        await saveUserProfile(userProfile);

        // Update presence
        await updateUserPresence(userProfile.id, {
          displayName: userProfile.name,
          avatarUrl: userProfile.avatar_url,
          partnerLabel: userProfile.partner_label,
          online: true,
          currentlyCoding: false,
        });

        // Initialize shared couple workspace
        const partner = profiles.find((p) => p.id !== userProfile.id) || INITIAL_PROFILES[1];
        const ws = await getOrCreateWorkspace(userProfile, partner);
        setWorkspace(ws);
      }
      setIsLoading(false);
    });

    return () => unsubAuth();
  }, [isFirebaseActive, profiles]);

  // Current and Partner User calculation
  const currentUser = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const partnerUser = profiles.find((p) => p.id !== activeUserId) || profiles[1];

  // Switch active persona (for testing couple mode seamlessly)
  const switchUser = useCallback((targetUserId?: string) => {
    const nextId = targetUserId || (currentUser.id === profiles[0].id ? profiles[1].id : profiles[0].id);
    setActiveUserId(nextId);

    const nextUser = profiles.find((p) => p.id === nextId);
    toast.success(`Switched active view to ${nextUser?.name || 'Partner'}!`, {
      description: `Now viewing as ${nextUser?.partner_label || 'Partner'}`,
      icon: "🔄",
    });

    // Update presence
    if (nextUser) {
      void updateUserPresence(nextUser.id, {
        displayName: nextUser.name,
        avatarUrl: nextUser.avatar_url,
        partnerLabel: nextUser.partner_label,
        online: true,
      });
    }
  }, [currentUser.id, profiles]);

  // Update profile
  const updateProfile = async (updated: Partial<Profile>, profileId = currentUser.id) => {
    const updatedProfiles = profiles.map((p) =>
      p.id === profileId ? { ...p, ...updated, updated_at: new Date().toISOString() } : p
    );
    setProfiles(updatedProfiles);

    const targetProfile = updatedProfiles.find((p) => p.id === profileId);
    if (targetProfile) {
      await saveUserProfile(targetProfile);
    }
  };

  // Google Login
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        toast.success(`Welcome to CodeTogether, ${result.user.displayName || "Coder"}! 🚀`);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      toast.error("Google Login failed: " + (err?.message || "Please check popup settings."));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub Login
  const signInWithGitHub = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, githubProvider);
      if (result.user) {
        toast.success(`Welcome to CodeTogether, ${result.user.displayName || "Coder"}! 🐙`);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("GitHub sign-in error:", err);
      toast.error("GitHub Login failed: " + (err?.message || "Please check GitHub auth settings."));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Firebase Email / Password Sign In
  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (result.user) {
        toast.success(`Welcome back, ${result.user.displayName || result.user.email?.split("@")[0] || "Coder"}! ✨`, {
          description: "Signed in securely with Firebase Auth.",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Firebase sign-in error:", err);
      toast.error(getFirebaseAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Firebase Email / Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string,
    partnerLabel?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (result.user) {
        const displayName = name?.trim() || email.split("@")[0] || "Partner";
        try {
          await updateFirebaseProfile(result.user, {
            displayName,
          });
        } catch (profileErr) {
          console.warn("Could not set display name on Firebase user:", profileErr);
        }

        const isGirlfriend = partnerLabel?.toLowerCase() === "girlfriend";
        const newProfile: Profile = {
          id: result.user.uid,
          email: result.user.email || email.trim(),
          name: displayName,
          partner_label: partnerLabel || "Partner",
          avatar_url: isGirlfriend ? "/girl-profile.jpg" : "/boy-profile.jpg",
          motto: "Building our dream stack together ✨",
          theme_color: isGirlfriend ? "rose" : "violet",
          current_streak: 1,
          total_hours: 0,
          problems_solved: 0,
          is_coding_now: false,
        };

        setProfiles((prev) => {
          const index = prev.findIndex(
            (p) => p.id === newProfile.id || (p.email && p.email.toLowerCase() === newProfile.email.toLowerCase())
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...newProfile };
            return normalizeProfiles(next);
          }
          if (prev.length >= 2 && (!prev[0].email || prev[0].email === "")) {
            return normalizeProfiles([newProfile, prev[1]]);
          } else if (prev.length >= 2 && (!prev[1].email || prev[1].email === "")) {
            return normalizeProfiles([prev[0], newProfile]);
          }
          return normalizeProfiles([...prev, newProfile]);
        });

        setActiveUserId(newProfile.id);
        await saveUserProfile(newProfile);

        toast.success(`Account created! Welcome, ${displayName}! 🎉`, {
          description: "Registered successfully via Firebase Auth.",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Firebase sign-up error:", err);
      toast.error(getFirebaseAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Password Reset Email
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset email sent! 📬", {
        description: `Check your inbox (${email.trim()}) for instructions to reset your password.`,
      });
      return true;
    } catch (err: any) {
      console.error("Firebase password reset error:", err);
      toast.error(getFirebaseAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Quick email login
  const loginWithEmail = async (email: string): Promise<boolean> => {
    const match = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setActiveUserId(match.id);
      toast.success(`Welcome back, ${match.name}! ✨`);
      return true;
    }
    toast.error("That email is not associated with a profile yet.");
    return false;
  };

  // Logout
  const logout = async () => {
    try {
      if (currentUser?.id) {
        await updateUserPresence(currentUser.id, { online: false, currentlyCoding: false });
      }
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setFirebaseUser(null);
      setActiveUserId(INITIAL_PROFILES[0].id);
      toast.info("Logged out successfully.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        partnerUser,
        allProfiles: profiles,
        workspace,
        switchUser,
        updateProfile,
        isFirebaseActive,
        isLoading,
        firebaseUser,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
