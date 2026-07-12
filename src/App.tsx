import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GeneralArea from './pages/GeneralArea';
import Upgrade from './pages/Upgrade';
import Referrals from './pages/Referrals';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AnnouncementBanner from './components/AnnouncementBanner';

function TrialMiddleware({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        if (mounted) {
          setDbError(true);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          if (userError.message.includes('Auth session missing')) {
            if (mounted) setLoading(false);
            return;
          }
          throw userError;
        }
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        // Check if profile exists
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
              
        if (error) throw error;

        let currentUserProfile = data;

        if (!data) {
          // Profile doesn't exist, create it (likely a new OAuth sign-up)
          const urlParams = new URLSearchParams(window.location.search);
          const referralCode = urlParams.get('ref');

          const { data: newProfile, error: insertError } = await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            plan: user.email === 'taiwofasuyi@gmail.com' ? 'lifetime' : 'free',
            referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referred_by: referralCode,
            total_earned: 0,
          }, { onConflict: 'id' }).select().maybeSingle();

          if (insertError) throw insertError;
          currentUserProfile = newProfile;
        }

        // Auto-upgrade existing admin if somehow they are on free plan
        if (currentUserProfile && currentUserProfile.email === 'taiwofasuyi@gmail.com' && currentUserProfile.plan !== 'lifetime') {
           const { data: updatedProfile, error: updateError } = await supabase.from('users').update({ plan: 'lifetime' }).eq('id', user.id).select().maybeSingle();
           if (!updateError && updatedProfile) {
              currentUserProfile = updatedProfile;
           }
        }

        if (mounted && currentUserProfile) {
          setProfile(currentUserProfile);
        } else if (mounted) {
          setProfile(null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location]);

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Supabase Setup Required</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Please add your Supabase credentials to the environment variables to continue.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-xs font-mono text-gray-600 space-y-2 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1 border-b border-gray-200 pb-2">Required Variables:</p>
            <p className="break-all"><span className="text-purple-600 font-bold">VITE_SUPABASE_URL</span>=your_url</p>
            <p className="break-all"><span className="text-purple-600 font-bold">VITE_SUPABASE_ANON_KEY</span>=your_key</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return null;

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to get session:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#008751]/30">
        <AnnouncementBanner />
        <Navbar />
        <TrialMiddleware>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route 
              path="/general" 
              element={user ? <GeneralArea /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/upgrade" 
              element={user ? <Upgrade /> : <Navigate to="/" />} 
            />
            <Route 
              path="/referrals" 
              element={user ? <Referrals /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin" 
              element={user && user.email === 'taiwofasuyi@gmail.com' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </TrialMiddleware>
      </div>
    </BrowserRouter>
  );
}
