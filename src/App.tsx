import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getTrialDaysRemaining } from './lib/utils';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GeneralArea from './pages/GeneralArea';
import Upgrade from './pages/Upgrade';
import Referrals from './pages/Referrals';
import { seedFirestore } from './lib/seed';

function TrialMiddleware({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Seed data in dev
    if (process.env.NODE_ENV === 'development') {
      seedFirestore();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert timestamp to ISO string for getTrialDaysRemaining
        const trialStartDate = data.trial_start_date?.toDate?.()?.toISOString() || data.trial_start_date;
        setProfile({ ...data, trial_start_date: trialStartDate });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [location]);

  if (loading) return null;

  // If user is logged in, on free plan, and trial expired
  if (profile && profile.plan === 'free') {
    const daysRemaining = getTrialDaysRemaining(profile.trial_start_date);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#008751]/30">
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </TrialMiddleware>
      </div>
    </BrowserRouter>
  );
}
