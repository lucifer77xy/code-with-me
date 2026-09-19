"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Profile, Workspace } from "@/types";
import { INITIAL_PROFILES } from "@/data/initialData";
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
