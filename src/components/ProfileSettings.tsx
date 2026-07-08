import React, { useState } from 'react';
import { X, User, Camera, Tag, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onUpdate: (updatedProfile: Profile) => void;
}

export default function ProfileSettings({ isOpen, onClose, profile, onUpdate }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          skills: skills,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onUpdate(data as Profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#008751]/10 rounded-xl flex items-center justify-center text-[#008751]">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Manage your identity & preferences</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-100 border-4 border-gray-50">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl pointer-events-none">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Email (Primary)</label>
                    <input
                      readOnly
                      value={profile.email}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Skills & Expertise</label>
                <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. React, UX Design)"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008751]/10 text-[#008751] text-xs font-bold rounded-lg border border-[#008751]/20"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-[#008751] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#008751]/20 hover:bg-[#007646] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
