import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <span className="font-bold text-gray-900 group-hover:text-[#008751] transition-colors">
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-colors ${isOpen ? 'bg-[#008751] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: "Is there a free plan?",
      answer: "Yes, our Free Mode allows you to explore the platform indefinitely. You can view basic job listings, access the foundational skills course, and join our community. Upgrade anytime to unlock premium jobs and full courses."
    },
    {
      question: "What are the benefits of a premium membership?",
      answer: "Premium members get full access to high-paying remote job listings (₦2M+ average salary), exclusive skill-building courses, early bird alerts for new opportunities, and eligibility for our referral earning program."
    },
    {
      question: "What is the difference between the Starter and Pro plans?",
      answer: "The Starter plan (₦8,000/mo) includes access to all remote jobs and basic courses. The Pro plan (₦15,000/mo) gives you everything in Starter plus advanced mastery courses, priority application reviews, and direct mentorship opportunities."
    },
    {
      question: "How does the Lifetime membership work?",
      answer: "For a one-time payment of ₦80,000, you get permanent, unrestricted access to all current and future features on NaijaRemoteHub, including all Pro plan benefits, forever. No more monthly renewals."
    },
    {
      question: "How does the referral program work?",
      answer: "Every member gets a unique referral code. When someone signs up using your code and upgrades to a premium plan, you earn a ₦1,500+ commission. You can track your earnings and request withdrawals from your referral dashboard."
    },
    {
      question: "Are the jobs listed only for Nigerians?",
      answer: "While we curate opportunities specifically accessible to Nigerians without auto-rejections based on location, most jobs are fully remote and open to global talent. We focus on companies that hire across Africa and beyond."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#008751]/10 text-[#008751] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              <HelpCircle size={16} />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 font-medium text-lg">
              Everything you need to know about NaijaRemoteHub membership and usage.
            </p>
          </div>

          <div className="bg-gray-50/50 rounded-3xl p-8 md:p-12 border border-gray-100">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium">
              Still have questions? <a href="mailto:naijaremotehub@gmail.com" className="text-[#008751] font-bold hover:underline">Contact Admin</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
