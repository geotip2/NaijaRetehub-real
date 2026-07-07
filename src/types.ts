export type UserPlan = 'free' | 'starter' | 'pro' | 'lifetime';

export interface Profile {
  id: string;
  email: string;
  plan: UserPlan;
  trial_start_date: string;
  referral_code: string;
  referred_by?: string;
  total_earned: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  type: 'Full-time' | 'Contract' | 'Freelance';
  location: string;
  salary?: string;
  category: string;
  is_free: boolean;
  posted_at: string;
  apply_url: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  is_free: boolean;
  content_url: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  earned_amount: number;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface Payout {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  bank_details: {
    bank_name: string;
    account_number: string;
  };
  created_at: string;
}
