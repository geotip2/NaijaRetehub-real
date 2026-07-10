import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Job, Course, Profile } from '../types';
import JobCard from '../components/JobCard';
import ProfileSettings from '../components/ProfileSettings';
import { getTrialDaysRemaining } from '../lib/utils';
import { Clock, Briefcase, GraduationCap, Users, AlertCircle, Search, Filter, ChevronDown, DollarSign, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData(userId?: string) {
      if (!userId) {
        navigate('/');
        return;
      }

      // Load Profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!profileError && profileData) {
        setProfile(profileData as Profile);

        // Trial check
        if (profileData.plan === 'free') {
          const daysRemaining = getTrialDaysRemaining(profileData.created_at);
          if (daysRemaining <= 0) {
            navigate('/upgrade');
            return;
          }
        }
      }

      // Load Jobs
      const { data: jobsList } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      
      // Load Courses
      const { data: coursesList } = await supabase
        .from('courses')
        .select('*');

      setJobs((jobsList || []) as Job[]);
      setCourses((coursesList || []) as Course[]);
      setLoading(false);
    }

    // We don't need to explicitly call getUser here because 
    // onAuthStateChange will fire on initial mount if a session exists.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadData(session?.user?.id);
    });

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadData(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(jobs.map(j => j.category))];
    return cats;
  }, [jobs]);

  const types = ['All', 'Full-time', 'Contract', 'Freelance'];

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
      const matchesType = selectedType === 'All' || job.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [jobs, searchTerm, selectedCategory, selectedType]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]" />
    </div>
  );

  const daysRemaining = profile ? getTrialDaysRemaining(profile.created_at) : 0;
  const isFreeTrial = profile?.plan === 'free';

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <main className="grid grid-cols-12 gap-4">
          
          {/* Welcome & Trial Banner Bento */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-gray-50">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome back, {profile?.full_name || profile?.email.split('@')[0]}! 👋</h1>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                  >
                    <Settings size={18} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Your current plan is <span className="font-semibold text-[#008751] capitalize">{profile?.plan}</span></p>
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        +{profile.skills.length - 3} More
                      </span>
                    )}
                  </div>
                )}
              </div>
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
              <button onClick={() => navigate('/upgrade')} className="mt-4 bg-white text-[#008751] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors">
                Upgrade Account <span className="transition-transform">→</span>
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="text-8xl text-white">🇳🇬</span>
            </div>
          </div>

          {/* Jobs Bento with Filter */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col min-h-[600px]">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Premium Jobs</h3>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-[#008751] text-white border-[#008751]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                >
                  <Filter size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search titles or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] transition-all"
                />
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 mb-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Category</label>
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:outline-none focus:border-[#008751]"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Work Type</label>
                        <select 
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:outline-none focus:border-[#008751]"
                        >
                          {types.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 scrollbar-hide flex-1">
              {filteredJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 text-sm font-medium">No jobs match your filters.</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedType('All'); }}
                    className="mt-2 text-[#008751] text-xs font-bold hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                filteredJobs.map((job: any) => (
                  <div key={job.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#008751] cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{job.location} • {job.type}</p>
                      {isFreeTrial && !job.is_free && <span className="text-[10px] text-red-500 font-bold">LOCK</span>}
                    </div>
                    <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#008751] transition-colors">{job.title}</h4>
                    <p className="text-xs text-gray-400 font-medium mb-2">{job.company}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-[#008751] font-bold">
                        {isFreeTrial && !job.is_free ? '₦ [Unlock to view]' : job.salary || 'Competitive'}
                      </p>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-white border border-gray-100 rounded text-gray-400 uppercase">
                        {job.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
                  <input readOnly value={`${window.location.origin}/?ref=${profile?.referral_code}`} className="text-[10px] bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-gray-500 font-mono w-full md:w-64 truncate" />
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

      {profile && (
        <ProfileSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onUpdate={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}
    </div>
  );
}
