import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Profile } from '../types';
import { Copy, Users, Wallet, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Referrals() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const referralLink = `${window.location.origin}/join?ref=${profile?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copied to clipboard!');
  };

  const handleRequestPayout = async () => {
    if (!accountNumber || !bankName) {
      alert('Please fill in your bank details');
      return;
    }
    if ((profile?.total_earned || 0) < 5000) {
      alert('Minimum payout is ₦5,000');
      return;
    }
    
    setPayoutLoading(true);
    // Call our server-side payout endpoint
    try {
      const response = await fetch('/api/payouts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: profile?.total_earned,
          bankCode: '044', // Simplified for demo
          accountNumber: accountNumber,
          userId: profile?.id
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Payout request initiated!');
      } else {
        alert('Payout failed: ' + (data.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Error requesting payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Affiliate Hub</h1>
          <p className="text-gray-600 font-medium">Earn up to 15% recurring commission for every friend you bring.</p>
        </header>

        <div className="grid grid-cols-12 gap-4 mb-12">
          <div className="col-span-12 md:col-span-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Users size={20} className="text-[#008751]" />
              <span>Your Unique Referral Link</span>
            </h3>
            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <input 
                readOnly 
                value={referralLink}
                className="bg-transparent border-none outline-none flex-1 text-sm font-medium px-4 text-gray-600"
              />
              <button 
                onClick={copyLink}
                className="bg-[#1A1A1A] text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
              10% for Starter referrals • 15% for Pro referrals
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 bg-[#008751] text-white p-8 rounded-2xl shadow-lg shadow-[#008751]/20">
            <div className="flex items-center justify-between mb-8">
              <Wallet size={28} />
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Available</p>
            </div>
            <h3 className="text-3xl font-black mb-2">₦{profile?.total_earned.toLocaleString()}</h3>
            <p className="text-xs opacity-80 font-medium">Earned this month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <CreditCard size={20} className="text-[#008751]" />
              <span>Withdrawal Settings</span>
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nigerian Bank Name</label>
                <input 
                  placeholder="e.g. Access Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#008751]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                <input 
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#008751]"
                />
              </div>
            </div>

            <div className="p-6 bg-[#FFD700]/10 rounded-2xl border border-[#FFD700]/20 mb-8 flex items-start space-x-4">
              <div className="bg-[#FFD700] p-1 rounded-full text-[#1A1A1A]">
                <ChevronRight size={14} />
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Payouts are processed every Friday. Minimum withdrawal is <strong>₦5,000</strong>.
              </p>
            </div>

            <button 
              disabled={payoutLoading}
              onClick={handleRequestPayout}
              className="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {payoutLoading ? <Loader2 className="animate-spin" size={24} /> : <span>Request Payout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
