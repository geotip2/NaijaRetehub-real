import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Job, Course, Profile } from '../types';
import JobCard from '../components/JobCard';
import UserProfile from '../components/UserProfile';
import { Clock, Briefcase, GraduationCap, Users, AlertCircle, Search, Filter, ChevronDown, DollarSign, Settings, User, Link, Github, Linkedin, Loader2 } from 'lucide-react';
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
  const [jobTab, setJobTab] = useState<'platform' | 'linkedin'>('platform');
  const [linkedInJobs, setLinkedInJobs] = useState<any[]>([]);
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  useEffect(() => {
    if (jobTab === 'linkedin' && profile && profile.plan !== 'free' && linkedInJobs.length === 0) {
      async function fetchLinkedInJobs() {
        setLoadingLinkedIn(true);
        setLinkedInError(null);
        try {
          const res = await fetch('/api/linkedin-jobs?query=' + encodeURIComponent('remote software engineer'));
          const data = await res.json();
          if (data && data.error) {
             setLinkedInError(data.error);
          } else if (data && data.success === false) {
             setLinkedInError(data.message || "Failed to load from LinkedIn API");
          } else if (data && data.data) {
            setLinkedInJobs(data.data);
          }
        } catch (err) {
          console.error("Failed to load linkedin jobs:", err);
          setLinkedInError("Failed to connect to API");
        } finally {
          setLoadingLinkedIn(false);
        }
      }
      fetchLinkedInJobs();
    }
  }, [jobTab, profile, linkedInJobs.length]);

  useEffect(() => {
    async function loadData(userId?: string) {
      if (!userId) {
        navigate('/');
        return;
      }
      try {
        // Load Profile
        let { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (!profileData && !profileError) {
          // Create profile if missing
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (user) {
            const newProfile = {
              id: user.id,
              email: user.email || '',
              plan: 'free',
              referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              created_at: new Date().toISOString()
            };
            await supabase.from('users').insert(newProfile);
            profileData = newProfile;
          }
        }

        if (profileData) {
          setProfile(profileData as Profile);
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
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    // We don't need to explicitly call getUser here because 
    // onAuthStateChange will fire on initial mount if a session exists.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadData(session?.user?.id);
    });

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadData(session?.user?.id);
    }).catch(err => {
      console.warn('Failed to get session in Dashboard:', err);
      setLoading(false);
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

  const isFreePlan = (profile?.plan || 'free') === 'free';

  const handleToggleCourse = async (courseId: string) => {
    if (!profile) return;
    
    const currentCompleted = profile.completed_courses || [];
    const isCompleted = currentCompleted.includes(courseId);
    
    const newCompleted = isCompleted 
      ? currentCompleted.filter(id => id !== courseId)
      : [...currentCompleted, courseId];
      
    // Optimistic update
    setProfile({ ...profile, completed_courses: newCompleted });
    
    // DB update
    const { error } = await supabase
      .from('users')
      .update({ completed_courses: newCompleted })
      .eq('id', profile.id);
      
    if (error) {
      console.error('Failed to update course progress:', error);
      // Revert on error
      setProfile({ ...profile, completed_courses: currentCompleted });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <main className="grid grid-cols-12 gap-4">
          
          <div className="col-span-12 mb-2">
            <h1 className="text-2xl font-black text-[#1A1A1A]">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-gray-500 font-medium">You are currently a <span className="font-bold text-[#008751] uppercase">{profile?.plan || 'free'}</span> member.</p>
          </div>

          {/* User Profile Overview Bento */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-gray-50 relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black uppercase">
                      {(profile?.full_name || profile?.email || '?').charAt(0)}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Settings className="text-white w-6 h-6" />
                  </button>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                      {profile?.full_name || profile?.email.split('@')[0]}
                    </h1>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      (profile?.plan || 'free') === 'free' ? 'bg-gray-100 text-gray-500' :
                      profile?.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                      profile?.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {profile?.plan || 'free'} MEMBER
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium flex items-center gap-2 flex-wrap">
                    {profile?.title && <span className="text-gray-700">{profile.title}</span>}
                    {profile?.title && <span>•</span>}
                    <span>{profile?.email}</span>
                    {profile?.location && <span>•</span>}
                    {profile?.location && <span>{profile.location}</span>}
                  </p>
                  
                  {(profile?.bio || profile?.portfolio_url || profile?.github_url || profile?.linkedin_url) && (
                    <div className="mt-4">
                      {profile?.bio && <p className="text-sm text-gray-600 mb-3 max-w-2xl">{profile.bio}</p>}
                      <div className="flex flex-wrap gap-4">
                        {profile?.portfolio_url && (
                          <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#008751] transition-colors">
                            <Link size={14} /> Portfolio
                          </a>
                        )}
                        {profile?.github_url && (
                          <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            <Github size={14} /> GitHub
                          </a>
                        )}
                        {profile?.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-700 transition-colors">
                            <Linkedin size={14} /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="hidden md:flex px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold transition-colors items-center gap-2 border border-gray-100"
              >
                <Settings size={14} />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Membership</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    profile?.plan === 'free' ? 'bg-gray-400' :
                    profile?.plan === 'starter' ? 'bg-blue-500' :
                    profile?.plan === 'pro' ? 'bg-purple-500' :
                    'bg-amber-500'
                  }`}></div>
                  <p className="text-sm font-bold text-gray-700 uppercase">{profile?.plan || 'Free'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Joined</p>
                <p className="text-sm font-bold text-gray-700">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Skills</p>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                        +{profile.skills.length - 4}
                      </span>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setIsSettingsOpen(true)} className="text-xs text-[#008751] font-bold hover:underline">
                    + Add Skills
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Membership Level Bento */}
          <div className={`col-span-12 lg:col-span-4 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden ${
            profile?.plan === 'starter' ? 'bg-blue-600' :
            profile?.plan === 'pro' ? 'bg-purple-600' :
            profile?.plan === 'lifetime' ? 'bg-amber-500' :
            'bg-[#008751]'
          }`}>
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Current Membership</p>
              <h3 className="text-white text-2xl font-black uppercase tracking-widest mb-1">{profile?.plan || 'FREE'} PLAN</h3>
              
              {profile?.plan === 'free' || profile?.plan === 'starter' ? (
                <>
                  <p className="text-white/90 text-sm mb-4">Upgrade to unlock more daily job leads.</p>
                  <button onClick={() => navigate('/upgrade')} className={`bg-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors ${
                    profile?.plan === 'starter' ? 'text-blue-600' : 'text-[#008751]'
                  }`}>
                    Upgrade Account <span className="transition-transform">→</span>
                  </button>
                </>
              ) : (
                <p className="mt-2 text-white/90 text-sm font-medium">You have unlocked premium access.</p>
              )}
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="text-8xl text-white">🇳🇬</span>
            </div>
          </div>

          {/* Jobs Bento with Filter */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col min-h-[600px]">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Daily Job Leads</h3>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-[#008751] text-white border-[#008751]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                >
                  <Filter size={18} />
                </button>
              </div>

              <div className="flex space-x-2 mb-4 bg-gray-50 p-1 rounded-xl relative">
                <button
                  onClick={() => setJobTab('platform')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${jobTab === 'platform' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-[#1A1A1A]'}`}
                >
                  Platform Jobs
                </button>
                <button
                  onClick={() => setJobTab('linkedin')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${jobTab === 'linkedin' ? 'bg-[#0077B5] text-white shadow-sm' : 'text-gray-500 hover:text-[#0077B5]'}`}
                >
                  LinkedIn Leads
                </button>
              </div>
              
              {jobTab === 'linkedin' && !isFreePlan && (
                <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-gray-500">
                  <span className="uppercase tracking-wider">
                    {profile?.plan === 'starter' ? 'Showing 4 of 10 daily leads' : 'Showing all 25 daily leads'}
                  </span>
                  {profile?.plan === 'starter' && (
                    <button onClick={() => navigate('/upgrade')} className="text-[#0077B5] hover:underline">
                      Upgrade for more
                    </button>
                  )}
                </div>
              )}

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
              {jobTab === 'linkedin' ? (
                isFreePlan ? (
                  <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-900 font-bold mb-2">Unlock LinkedIn Leads</p>
                    <p className="text-gray-500 text-sm mb-4">Upgrade to Starter or Pro to get daily curated remote job leads directly from LinkedIn.</p>
                    <button onClick={() => navigate('/upgrade')} className="bg-[#0077B5] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#006097] transition-colors">
                      Upgrade Now
                    </button>
                  </div>
                ) : loadingLinkedIn ? (
                  <div className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Fetching live jobs from LinkedIn...</p>
                  </div>
                ) : linkedInError ? (
                  <div className="py-12 text-center px-4">
                    <AlertCircle className="mx-auto mb-2 text-red-400" size={24} />
                    <p className="text-gray-900 font-bold mb-2">API Notice</p>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">{linkedInError}</p>
                  </div>
                ) : linkedInJobs.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-400 text-sm font-medium">No live LinkedIn jobs found.</p>
                  </div>
                ) : (
                  (profile?.plan === 'starter' ? linkedInJobs.slice(0, 4) : linkedInJobs).map((job: any) => (
                    <div key={job.job_id || job.id} className="p-4 rounded-xl border border-gray-100 bg-[#f8fcfd] hover:border-[#0077B5] cursor-pointer transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#0077B5]"></div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{job.job_city || job.job_state || job.job_country || job.location || 'Remote'} • {job.job_employment_type || job.type || 'Full-time'}</p>
                        <span className="text-[10px] text-[#0077B5] font-bold">{job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : (job.posted_at || 'Recent')}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#0077B5] transition-colors">{job.job_title || job.title}</h4>
                      <p className="text-xs text-gray-400 font-medium mb-2">{job.employer_name || job.company}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-xs text-[#008751] font-bold">
                          {job.job_min_salary ? `$${job.job_min_salary} - $${job.job_max_salary}` : (job.salary || 'Salary not listed')}
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (job.job_apply_link || job.apply_url) window.open(job.job_apply_link || job.apply_url, '_blank');
                          }}
                          className="text-[9px] font-bold px-3 py-1 bg-[#0077B5] text-white rounded uppercase hover:bg-[#006097] transition-colors"
                        >
                          Apply via LinkedIn
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : filteredJobs.length === 0 ? (
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
                      {isFreePlan && !job.is_free && <span className="text-[10px] text-red-500 font-bold">LOCK</span>}
                    </div>
                    <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#008751] transition-colors">{job.title}</h4>
                    <p className="text-xs text-gray-400 font-medium mb-2">{job.company}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-[#008751] font-bold">
                        {isFreePlan && !job.is_free ? '₦ [Unlock to view]' : job.salary || 'Competitive'}
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

            {/* PROGRESS TRACKER */}
            <div className="px-6 pt-6 pb-0">
              <div className="flex justify-between items-end mb-2">
                 <p className="text-sm font-bold text-gray-700">Course Progress</p>
                 <p className="text-xs text-gray-500 font-medium">
                   {profile?.completed_courses?.length || 0} of {courses.length} Completed
                 </p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[#008751] transition-all duration-500" 
                   style={{ width: `${courses.length > 0 ? ((profile?.completed_courses?.length || 0) / courses.length) * 100 : 0}%` }}
                 ></div>
              </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 2).map((course, i) => {
                const isCompleted = profile?.completed_courses?.includes(course.id);
                return (
                <div key={i} className={`relative rounded-xl p-5 flex flex-col justify-between ${i === 0 ? 'bg-[#1A1A1A] text-white' : 'border-2 border-dashed border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[10px] rounded inline-block font-bold ${course.is_free ? 'bg-[#008751] text-white' : 'bg-[#FFD700] text-[#1A1A1A]'}`}>
                        {course.is_free ? 'FREE' : 'PREMIUM'}
                      </span>
                      {isCompleted && (
                        <span className="text-[#008751]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm mb-2">{course.title}</h4>
                    <p className={`text-[10px] leading-relaxed ${i === 0 ? 'text-gray-400' : 'text-gray-500'}`}>{course.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-mono opacity-60">
                      {isCompleted ? 'Completed' : 'Ready to start'}
                    </span>
                    <button 
                      onClick={() => handleToggleCourse(course.id)}
                      className="text-[10px] font-bold underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                      {isCompleted ? 'Undo' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              )})}
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
        <UserProfile
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onUpdate={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}
    </div>
  );
}
