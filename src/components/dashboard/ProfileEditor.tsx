"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/context/SyncContext";

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose }) => {
  const { currentUser, partnerUser } = useAuth();
  const { updateProfileLive } = useSync();
  const [editingId, setEditingId] = useState(currentUser.id);
  const [name, setName] = useState(currentUser.name);
  const [motto, setMotto] = useState(currentUser.motto);
  const [isSaving, setIsSaving] = useState(false);

  const profile = editingId === currentUser.id ? currentUser : partnerUser;

  useEffect(() => {
    setName(profile.name);
    setMotto(profile.motto);
  }, [profile.id, profile.name, profile.motto]);

  if (!isOpen) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    await updateProfileLive(editingId, { name: name.trim(), motto: motto.trim() });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
      <form onSubmit={handleSave} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-300">
              <Pencil className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Profile settings</span>
            </div>
            <h2 id="profile-editor-title" className="mt-2 text-xl font-bold text-white">Edit profile</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close profile editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex rounded-xl border border-white/10 bg-slate-950 p-1">
          {[currentUser, partnerUser].map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setEditingId(candidate.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${editingId === candidate.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {candidate.id === currentUser.id ? "My profile" : "Partner profile"}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-xs font-semibold text-slate-300" htmlFor="profile-name">Display name</label>
        <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400" />

        <label className="mt-4 block text-xs font-semibold text-slate-300" htmlFor="profile-motto">Profile detail</label>
        <textarea id="profile-motto" value={motto} onChange={(event) => setMotto(event.target.value)} maxLength={120} rows={3} className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400" />

        <button type="submit" disabled={isSaving || !name.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};
