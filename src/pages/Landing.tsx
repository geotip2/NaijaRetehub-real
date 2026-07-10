import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Briefcase, Globe, Zap, ArrowRight, ShieldCheck, Star, User, Award } from 'lucide-react';
import PricingTable from '../components/PricingTable';
import AuthModal from '../components/AuthModal';
import FAQ from '../components/FAQ';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanSelect = (plan?: any) => {
    if (user) {
      if (plan?.id === 'free') {
        navigate('/dashboard');
      } else {
        navigate('/upgrade');
      }
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-[#008751]/5 to-transparent rounded-bl-[200px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-[#008751]/10 text-[#008751] px-4 py-2 rounded-full text-sm font-bold mb-8"
            >
              <Zap size={16} />
              <span>THE FIRST REMOTE WORK HUB FOR NIGERIANS</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8"
            >
              Work from Nigeria,<br />
              <span className="text-[#008751]">Earn in Dollars.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 leading-relaxed font-medium"
            >
              Access hand-picked international remote jobs paying ₦2M+ per month. 
              Master high-demand global skills and earn passive commissions by referring others. 
              No more filtering through scammy LinkedIn posts—everything you need to win globally is here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button 
                onClick={handlePlanSelect}
                className="w-full sm:w-auto bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#333] transition-all flex items-center justify-center space-x-2"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={20} />
              </button>
              <div className="flex items-center space-x-2 text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                  ))}
                </div>
                <span className="text-sm">Joined by 2,000+ Nigerians</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Ecosystem */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your All-in-One Global Career Hub</h2>
            <p className="text-gray-500 font-medium text-lg">We don't just list jobs; we build global careers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Premium Remote Jobs', 
                desc: 'Get exclusive access to verified international roles paying ₦2M+ that are actively looking for Nigerian talent.', 
                icon: <Briefcase className="text-[#008751]" size={32} />,
                tag: 'EARN IN DOLLARS'
              },
              { 
                title: 'Global Skill Academy', 
                desc: 'Learn high-income skills like UX Design, Cloud Computing, and Technical Writing through our curated path.', 
                icon: <Globe className="text-[#008751]" size={32} />,
                tag: 'LEVEL UP'
              },
              { 
                title: 'Referral Earnings', 
                desc: 'Earn ₦1,500+ for every friend you refer who joins the hub. Build a passive income stream while you job hunt.', 
                icon: <Zap className="text-[#008751]" size={32} />,
                tag: 'PASSIVE INCOME'
              }
            ].map((pillar, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-[#008751] transition-all">
                <div className="w-16 h-16 bg-[#008751]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <span className="text-[10px] font-black text-[#008751] tracking-widest uppercase mb-2">{pillar.tag}</span>
                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why the price */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why ₦8,000/month?</h2>
          <p className="text-gray-600 mb-16 font-medium">It's less than the price of a KFC meal. Here is what you're actually paying for:</p>
          <div className="space-y-6">
            {[
              "We spend 40+ hours weekly hand-picking real jobs that don't auto-reject Nigerians.",
              "Access to a ₦15M/year remote work curriculum (Exclusive courses).",
              "Referral system where 1 friend pays for your entire month."
            ].map((text, i) => (
              <div key={i} className="flex items-center p-6 bg-[#008751]/5 rounded-2xl text-left border border-[#008751]/10">
                <ShieldCheck className="text-[#008751] mr-4 shrink-0" size={24} />
                <p className="font-bold text-gray-900">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50 overflow-hidden" id="pricing">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Choose Your Path</h2>
            <p className="text-gray-600 font-medium">Join Nigeria's elite remote work community.</p>
          </div>
          <PricingTable onSelectPlan={handlePlanSelect} />
        </div>
      </section>

      <FAQ />

      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">🇳🇬</span>
          <span className="font-bold text-lg text-[#008751]">NaijaRemoteHub</span>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4 text-sm font-bold text-gray-500">
          <a href="mailto:naijaremotehub@gmail.com" className="text-[#008751] hover:underline">Contact Admin</a>
        </div>
        <p className="text-gray-500 text-sm">© 2026 NaijaRemoteHub. Empowering Nigerian Talents.</p>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
