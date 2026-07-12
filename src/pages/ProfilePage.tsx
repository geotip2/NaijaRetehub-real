import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import UserProfile from '../components/UserProfile';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <UserProfile 
          isOpen={true} 
          onClose={() => navigate('/dashboard')} 
          profile={profile} 
          onUpdate={(updatedProfile) => setProfile(updatedProfile)} 
        />
      </div>
    </div>
  );
}
