import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Profile } from '../types';
import PricingTable from '../components/PricingTable';
import { CheckCircle, ShieldCheck, Lock } from 'lucide-react';

export default function Upgrade() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
      }
      setLoading(false);
    }
    loadProfile();
  }, [navigate]);

  const handlePaymentSuccess = async (response: any, planId: string) => {
    // In a real app, verify transaction with Flutterwave API
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          plan: planId
        });
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

    // Simulate Flutterwave modal
    const confirm = window.confirm(`Pay ${plan.price.toLocaleString()} for ${plan.name} access?`);
    if (confirm) {
      handlePaymentSuccess({ status: "successful" }, plan.id);
    }
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

        <div className="mt-12 text-gray-500 flex items-center justify-center space-x-2 text-sm font-bold">
           <ShieldCheck size={18} className="text-[#008751]" />
           <span>Secure Flutterwave Payment</span>
        </div>
      </div>
    </div>
  );
}
