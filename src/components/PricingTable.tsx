import { Check, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import PaymentButton from './PaymentButton';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    duration: '14 Days',
    features: ['Access General Area', '3 Sample Jobs', '1 Free Course', 'Community Access'],
    cta: 'Start Free Trial'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 8000,
    duration: 'per month',
    features: ['10 Jobs/week', '2 Courses', '10% Referral Payout', 'Email Support'],
    cta: 'Get Started'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    duration: 'per month',
    features: ['50+ Jobs/week', 'All Courses', '15% Referral Payout', 'Priority Support', 'Resume Review'],
    isPopular: true,
    cta: 'Join Pro'
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 80000,
    duration: 'one-time',
    features: ['Everything in Pro', 'Lifetime Access', 'Mentorship Sessions', 'Exclusive Hub Events'],
    cta: 'Go Lifetime'
  }
];

interface PricingTableProps {
  onSelectPlan: (plan: Plan) => void;
  user?: any;
  onPaymentSuccess?: (planId: string) => void;
}

export default function PricingTable({ onSelectPlan, user, onPaymentSuccess }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
      {plans.map((plan) => (
        <motion.div
          key={plan.id}
          whileHover={{ y: -5 }}
          className={`relative bg-white rounded-2xl p-8 border border-gray-200 transition-all ${
            plan.isPopular ? 'ring-2 ring-[#FFD700] shadow-xl' : 'shadow-sm'
          }`}
        >
          {plan.isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#1A1A1A] text-xs font-black px-4 py-1 rounded-full flex items-center space-x-1">
              <Star size={12} fill="currentColor" />
              <span>MOST POPULAR</span>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-gray-900">{formatCurrency(plan.price)}</span>
              <span className="ml-1 text-gray-500 text-sm">{plan.duration}</span>
            </div>
          </div>

          <ul className="space-y-4 mb-10">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-gray-600">
                <div className="bg-[#008751]/10 p-1 rounded-full mr-3 mt-0.5">
                  <Check size={14} className="text-[#008751]" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          {user && plan.id !== 'free' ? (
            <PaymentButton
              plan={plan}
              user={user}
              onSuccess={onPaymentSuccess || (() => {})}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.isPopular 
                  ? 'bg-[#FFD700] text-[#1A1A1A] hover:bg-[#f2cc00]' 
                  : 'bg-[#008751] text-white hover:bg-[#007043]'
              }`}
            />
          ) : (
            <button
              onClick={() => onSelectPlan(plan)}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.isPopular 
                  ? 'bg-[#FFD700] text-[#1A1A1A] hover:bg-[#f2cc00]' 
                  : plan.id === 'free' 
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-[#008751] text-white hover:bg-[#007043]'
              }`}
            >
              {plan.cta}
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
