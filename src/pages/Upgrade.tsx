import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import PricingTable from '../components/PricingTable';
import AuthModal from '../components/AuthModal';
import { CheckCircle, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Upgrade() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadProfile(userId?: string) {
      console.log('Loading profile for userId:', userId);
      if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Profile load result:', { data, error });

      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    }

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      loadProfile(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      loadProfile(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePaymentSuccess = async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let error;
        if (profile) {
          const res = await supabase
            .from('users')
            .update({ plan: planId })
            .eq('id', user.id);
          error = res.error;
        } else {
          const res = await supabase
            .from('users')
            .upsert({ 
              id: user.id, 
              email: user.email, 
              plan: planId,
              total_earned: 0,
              referral_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            }, { onConflict: 'id' });
          error = res.error;
        }
        
        if (error) throw error;

        alert(`Welcome to ${planId} membership!`);
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Failed to update plan. Please contact support.');
    }
  };

  const handlePlanSelect = (plan: any) => {
    if (plan.id === 'free') {
      navigate('/dashboard');
      return;
    }

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {!user && (
          <div className="mb-12 p-6 bg-white rounded-3xl border-2 border-dashed border-[#008751]/20 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-gray-500 mb-6">Please sign in or create an account to choose a membership plan.</p>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#008751] text-white px-8 py-3 rounded-xl font-bold"
            >
              Sign In to Continue
            </button>
          </div>
        )}

        <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-6">
          <Lock size={24} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Membership Required</h1>
        <p className="text-gray-600 font-medium mb-16">Choose a plan below to continue accessing high-paying remote jobs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
          {[
            { title: "Verified Jobs", desc: "Every job is manually checked." },
            { title: "Dollar Course", desc: "Learn to earn in foreign currencies." },
            { title: "Referral Payouts", desc: "Earn consistent monthly commissions." }
          ].map((benefit, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-3 text-left">
              <CheckCircle className="text-[#008751] shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <PricingTable onSelectPlan={handlePlanSelect} profile={profile} onPaymentSuccess={handlePaymentSuccess} />

        <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-2xl max-w-2xl mx-auto flex items-center justify-center space-x-3">
          <AlertCircle size={20} className="text-blue-500 shrink-0" />
          <p className="text-blue-700 text-sm font-bold">
            Important Note: During checkout, the beneficiary account name will appear as <span className="bg-blue-200 px-1 rounded">PETAI</span>.
          </p>
        </div>

        <div className="mt-12 text-gray-500 flex items-center justify-center space-x-2 text-sm font-bold">
           <ShieldCheck size={18} className="text-[#008751]" />
           <span>Secure Flutterwave Payment</span>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
