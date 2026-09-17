"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile } from "@/types";
import { hasLegacySeedData, INITIAL_PROFILES } from "@/data/initialData";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: Profile;
  partnerUser: Profile;
  allProfiles: Profile[];
  switchUser: (userId?: string) => void;
  updateProfile: (updated: Partial<Profile>, profileId?: string) => Promise<void>;
  isSupabaseActive: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ACTIVE_USER_ID = "codetogether_active_user_id";
const LOCAL_STORAGE_PROFILES = "codetogether_profiles";

const normalizeProfiles = (loadedProfiles: Profile[]): Profile[] =>
  loadedProfiles.map((profile, index) => ({
    ...profile,
    avatar_url: profile.avatar_url || (index === 0 ? "/boy-profile.jpg" : "/girl-profile.jpg"),
  }));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [activeUserId, setActiveUserId] = useState<string>(INITIAL_PROFILES[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseActive = isSupabaseConfigured();

  const clearLegacyLocalState = () => {
    const savedProfiles = localStorage.getItem(LOCAL_STORAGE_PROFILES);
    if (hasLegacySeedData(savedProfiles)) {
      localStorage.removeItem(LOCAL_STORAGE_PROFILES);
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_USER_ID);
      localStorage.removeItem("codetogether_sessions");
      localStorage.removeItem("codetogether_weakpoints");
      localStorage.removeItem("codetogether_notes");
      localStorage.removeItem("codetogether_badges");
    }
  };

  // Load initial profiles from LocalStorage or Supabase
  useEffect(() => {
    const initProfiles = async () => {
      try {
        if (isSupabaseActive && supabase) {
          const { data, error } = await supabase.from("profiles").select("*");
          if (!error && data && data.length >= 2) {
            setProfiles(normalizeProfiles(data as Profile[]));
          }
        } else {
          // Fallback to local storage
          clearLegacyLocalState();
          const savedProfiles = localStorage.getItem(LOCAL_STORAGE_PROFILES);
          if (savedProfiles) {
            try {
              setProfiles(normalizeProfiles(JSON.parse(savedProfiles)));
            } catch (e) {
              console.error("Error parsing saved profiles", e);
            }
          }
          const savedActiveId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_USER_ID);
          if (savedActiveId) {
            setActiveUserId(savedActiveId);
          }
        }
      } catch (err) {
        console.error("Failed to load profiles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initProfiles();
  }, [isSupabaseActive]);

  // Persist profiles when changed in local mode
  const persistProfilesLocally = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILES, JSON.stringify(newProfiles));
    } catch (e) {
      console.error(e);
    }
  };

  const currentUser = profiles.find((p) => p.id === activeUserId) || profiles[0];
  const partnerUser = profiles.find((p) => p.id !== activeUserId) || profiles[1];

  const switchUser = (targetUserId?: string) => {
    const nextId = targetUserId || (currentUser.id === profiles[0].id ? profiles[1].id : profiles[0].id);
    setActiveUserId(nextId);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER_ID, nextId);
    } catch (e) {
      console.error(e);
    }
    const nextUser = profiles.find((p) => p.id === nextId);
    toast.success(`Switched active view to ${nextUser?.name || 'Partner'}!`, {
      description: `Now viewing as ${nextUser?.partner_label || 'Partner'}`,
      icon: "🔄",
    });
  };

  const updateProfile = async (updated: Partial<Profile>, profileId = currentUser.id) => {
    const updatedProfiles = profiles.map((p) =>
      p.id === profileId ? { ...p, ...updated, updated_at: new Date().toISOString() } : p
    );
    persistProfilesLocally(updatedProfiles);

    if (isSupabaseActive && supabase) {
      try {
        await supabase
          .from("profiles")
          .update(updated)
          .eq("id", profileId);
      } catch (err) {
        console.error("Supabase profile update failed:", err);
      }
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const match = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setActiveUserId(match.id);
      try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER_ID, match.id);
      } catch (e) {
        console.error(e);
      }
      toast.success(`Welcome back, ${match.name}! ✨`);
      return true;
    }
    toast.error("That email is not associated with a profile yet.");
    return false;
  };

  const logout = () => {
    toast.info("Session reset to demo mode.");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        partnerUser,
        allProfiles: profiles,
        switchUser,
        updateProfile,
        isSupabaseActive,
        isLoading,
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
