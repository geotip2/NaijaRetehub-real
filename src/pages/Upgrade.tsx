import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import PricingTable from '../components/PricingTable';
import { CheckCircle, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function Upgrade() {
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data as Profile);
      }
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  const handlePaymentSuccess = async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ plan: planId })
          .eq('id', user.id);
        
        if (error) throw error;

        alert(`Welcome to ${planId} membership!`);
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Failed to update plan. Please contact support.');
    }
  };

  const config = {
    public_key: (import.meta as any).env.VITE_FLW_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-KEY',
    tx_ref: `NRH-${Date.now()}`,
    amount: 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: profile?.email || '',
      phone_number: '0000000000',
      name: profile?.email?.split('@')[0] || '',
    },
    customizations: {
      title: 'NaijaRemoteHub Membership',
      description: 'Upgrade your account. Note: Beneficiary account name is PETAI',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-abstract-logo-template.jpg',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePlanSelect = (plan: any) => {
    if (plan.id === 'free') {
      navigate('/dashboard');
      return;
    }

    if (!profile) return;

    handleFlutterPayment({
      callback: (response) => {
        if (response.status === "successful") {
          handlePaymentSuccess(plan.id);
        }
        closePaymentModal();
      },
      onClose: () => {},
    });
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto text-center">
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

        <PricingTable onSelectPlan={handlePlanSelect} />

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
    </div>
  );
}
