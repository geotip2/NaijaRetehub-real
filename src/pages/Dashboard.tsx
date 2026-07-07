import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Job, Course, Profile } from '../types';
import JobCard from '../components/JobCard';
import { getTrialDaysRemaining } from '../lib/utils';
import { Clock, Briefcase, GraduationCap, Users, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setLoading(false);
        return;
      }

      const profileData = docSnap.data();
      // Handle timestamp
      const trialStartDate = profileData.trial_start_date?.toDate?.()?.toISOString() || profileData.trial_start_date;
      const formattedProfile = { ...profileData, trial_start_date: trialStartDate } as Profile;
      setProfile(formattedProfile);

      // Trial check
      if (formattedProfile.plan === 'free') {
        const daysRemaining = getTrialDaysRemaining(formattedProfile.trial_start_date);
        if (daysRemaining <= 0) {
          navigate('/upgrade');
          return;
        }
      }

      const jobsQuery = query(collection(db, 'jobs'), orderBy('posted_at', 'desc'));
      const jobsSnap = await getDocs(jobsQuery);
      const jobsList = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];

      setJobs(jobsList);
      setCourses(coursesList);
      setLoading(false);
    }
    loadData();
  }, [navigate]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]" />
    </div>
  );

  const daysRemaining = profile ? getTrialDaysRemaining(profile.trial_start_date) : 0;
  const isFreeTrial = profile?.plan === 'free';

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <main className="grid grid-cols-12 gap-4">
          
          {/* Welcome & Trial Banner Bento */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome back, {profile?.email.split('@')[0]}! 👋</h1>
              <p className="text-gray-500 text-sm">Your current plan is <span className="font-semibold text-[#008751] capitalize">{profile?.plan}</span></p>
            </div>
            {isFreeTrial && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3 w-full md:w-auto">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <p className="text-sm text-orange-800">
                  <span className="font-bold">{daysRemaining} Days Remaining</span> until trial ends.
                  <button onClick={() => navigate('/upgrade')} className="ml-2 underline font-bold">Upgrade Now</button>
                </p>
              </div>
            )}
          </div>

          {/* Upgrade Teaser Bento */}
          <div className="col-span-12 lg:col-span-4 bg-[#008751] rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-1">Membership</p>
              <h3 className="text-white text-xl font-bold">Earn in Dollars Today</h3>
              <button onClick={() => navigate('/upgrade')} className="mt-4 text-white text-sm font-bold flex items-center gap-1 group">
                Upgrade Account <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="text-8xl text-white">🇳🇬</span>
            </div>
          </div>

          {/* Jobs Bento */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Premium Jobs</h3>
              <span className="text-xs text-[#008751] font-semibold cursor-pointer hover:underline">View All</span>
            </div>
            <div className="space-y-4 overflow-y-auto pr-1 scrollbar-hide">
              {jobs.map((job: any) => (
                <div key={job.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#008751] cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{job.location} • {job.type}</p>
                    {isFreeTrial && !job.is_free && <span className="text-[10px] text-red-500 font-bold">LOCK</span>}
                  </div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">{job.title}</h4>
                  <p className="text-xs text-[#008751] mt-1 font-bold">
                    {isFreeTrial && !job.is_free ? '₦ [Unlock to view]' : job.salary || 'Competitive'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Bento */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Learning Pathways</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500">Tech</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500">Careers</span>
              </div>
            </div>
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 2).map((course, i) => (
                <div key={i} className={`relative rounded-xl p-5 flex flex-col justify-between ${i === 0 ? 'bg-[#1A1A1A] text-white' : 'border-2 border-dashed border-gray-200 bg-gray-50'}`}>
                  <div>
                    <span className={`px-2 py-1 text-[10px] rounded mb-2 inline-block font-bold ${course.is_free ? 'bg-[#008751] text-white' : 'bg-[#FFD700] text-[#1A1A1A]'}`}>
                      {course.is_free ? 'FREE' : 'PREMIUM'}
                    </span>
                    <h4 className="font-bold text-sm mb-2">{course.title}</h4>
                    <p className={`text-[10px] leading-relaxed ${i === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{course.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-mono opacity-60">Ready to start</span>
                    <button className="text-[10px] font-bold underline underline-offset-4">Explore</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Stats Bento */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg">Referral Dashboard</h3>
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-1 rounded">Up to 15% Comm.</span>
            </div>
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Earned</p>
                <p className="text-3xl font-black text-[#1A1A1A]">₦{profile?.total_earned.toLocaleString()}</p>
              </div>
              <div className="md:border-l md:border-gray-100 md:pl-8">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Invite Link</p>
                <div className="flex gap-2 mt-1">
                  <input readOnly value={`naijaremote.hub/ref/${profile?.referral_code}`} className="text-[10px] bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-gray-500 font-mono w-full md:w-48" />
                  <button onClick={() => navigate('/referrals')} className="px-3 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold rounded-lg whitespace-nowrap">Manage</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Payout Bento */}
          <div className="col-span-12 lg:col-span-4 bg-[#FFD700] rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
            <div>
              <p className="text-[#1A1A1A] text-[10px] font-bold uppercase mb-1">Quick Action</p>
              <h4 className="text-[#1A1A1A] font-bold">Payout Request</h4>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] text-[#1A1A1A]/70 italic leading-tight">Minimum withdrawal is ₦5,000 via Flutterwave Transfer.</p>
              <button 
                onClick={() => navigate('/referrals')}
                className="w-full py-3 bg-white text-[#1A1A1A] text-[10px] font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                Withdraw to Bank
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
