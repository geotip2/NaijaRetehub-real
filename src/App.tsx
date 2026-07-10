import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getTrialDaysRemaining } from './lib/utils';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GeneralArea from './pages/GeneralArea';
import Upgrade from './pages/Upgrade';
import Referrals from './pages/Referrals';
import AdminDashboard from './pages/AdminDashboard';
import AnnouncementBanner from './components/AnnouncementBanner';

function TrialMiddleware({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
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
      
      if (!data) {
        // Profile doesn't exist, create it (likely a new OAuth sign-up)
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');

        const { data: newProfile, error: insertError } = await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          plan: 'free',
          referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referred_by: referralCode,
          total_earned: 0,
        }, { onConflict: 'id' }).select().maybeSingle();

        if (!insertError && mounted) {
          setProfile(newProfile);
        }
      } else if (data && mounted) {
        setProfile(data);
      }
      if (mounted) setLoading(false);
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

  if (loading) return null;

  // If user is logged in, on free plan, and trial expired
  if (profile && profile.plan === 'free') {
    const daysRemaining = getTrialDaysRemaining(profile.created_at); // Supabase uses created_at by default
    if (daysRemaining <= 0 && location.pathname !== '/upgrade') {
      return <Navigate to="/upgrade" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
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
            <Route path="/" element={<Landing />} />
            <Route path="/general" element={<GeneralArea />} />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/" />} 
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
