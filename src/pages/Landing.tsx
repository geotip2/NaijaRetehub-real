import { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Globe, Zap, ArrowRight, ShieldCheck, Star, User, Award } from 'lucide-react';
import PricingTable from '../components/PricingTable';
import AuthModal from '../components/AuthModal';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
              No more filtering through scammy LinkedIn posts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <button 
                onClick={() => setAuthModalOpen(true)}
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

      {/* How it Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">3 Steps to Dollar Earnings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Create Account', desc: 'Sign up for free and tell us your skills.', icon: <User className="text-[#008751]" size={32} /> },
              { title: 'Get Curated Jobs', desc: 'Receive daily remote jobs that actually hire Nigerians.', icon: <Briefcase className="text-[#008751]" size={32} /> },
              { title: 'Apply & Win', desc: 'Use our templates to beat international competition.', icon: <Award className="text-[#008751]" size={32} /> }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-[#008751]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 font-medium">{step.desc}</p>
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
          <PricingTable onSelectPlan={() => setAuthModalOpen(true)} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Is this for tech only?", a: "No! We have roles for Virtual Assistants, Customer Success, Writing, Design, and Tech." },
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription with one click from your dashboard." },
            { q: "How do referrals work?", a: "Invite friends and earn up to 15% of their subscription fee for as long as they stay members." }
          ].map((faq, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-2xl">
              <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
              <p className="text-gray-600 text-sm font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">🇳🇬</span>
          <span className="font-bold text-lg text-[#008751]">NaijaRemoteHub</span>
        </div>
        <p className="text-gray-500 text-sm">© 2026 NaijaRemoteHub. Empowering Nigerian Talents.</p>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
