import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Job, Course } from '../types';
import JobCard from '../components/JobCard';
import { Link } from 'react-router-dom';
import { Rocket, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function GeneralArea() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: jobsList } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_free', true)
        .limit(3);
      
      const { data: coursesList } = await supabase
        .from('courses')
        .select('*')
        .eq('is_free', true)
        .limit(1);

      setJobs((jobsList || []) as Job[]);
      setCourses((coursesList || []) as Course[]);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">The Free Zone</h1>
          <p className="text-gray-600 font-medium">A taste of what our paid members get every single day.</p>
        </div>

        {/* Upgrade Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#008751] rounded-2xl p-8 mb-16 text-white relative overflow-hidden"
        >
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold mb-2">Want 50+ more jobs like these?</h2>
            <p className="opacity-90 mb-6 font-medium">Upgrade to Starter or Pro to unlock the full database and start earning in USD.</p>
            <Link 
              to="/upgrade" 
              className="inline-flex items-center space-x-2 bg-white text-[#008751] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              <span>Unlock Everything</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          <Rocket className="absolute -bottom-4 -right-4 text-white/10 w-48 h-48 -rotate-12" />
        </motion.div>

        {/* Free Jobs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sample Remote Jobs</h2>
            <Link to="/upgrade" className="text-[#008751] font-bold text-sm hover:underline">View 54 more &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)
            ) : (
              // @ts-ignore
              jobs.map((job: any) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Course */}
          <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#008751]/10 p-2 rounded-xl">
                <GraduationCap className="text-[#008751]" size={24} />
              </div>
              <h2 className="text-xl font-bold">Free Mini-Course</h2>
            </div>
            {courses[0] ? (
              <div className="group">
                <img 
                  src={courses[0].thumbnail} 
                  alt="Course" 
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{courses[0].title}</h3>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{courses[0].description}</p>
                <Link to="/upgrade" className="block text-center py-3 border-2 border-[#008751] text-[#008751] rounded-xl font-bold hover:bg-[#008751] hover:text-white transition-all">
                  Access Course
                </Link>
              </div>
            ) : (
              <div className="h-48 bg-gray-100 rounded-2xl" />
            )}
          </section>

          {/* Blog/Resources */}
          <section className="bg-[#1A1A1A] p-8 rounded-3xl text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/10 p-2 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold">Latest from Blog</h2>
            </div>
            <div className="space-y-6">
              <div className="pb-6 border-b border-white/10">
                <h3 className="font-bold mb-2">How to get paid in USD while living in Lagos</h3>
                <p className="text-sm text-gray-400">Read our guide on setting up Geegpay/Grey for remote earnings...</p>
              </div>
              <div className="pb-6">
                <h3 className="font-bold mb-2">Top 5 Skills for 2026 Remote Market</h3>
                <p className="text-sm text-gray-400">Focus on AI, No-code, and specialized Customer Success...</p>
              </div>
              <button className="w-full py-3 bg-[#008751] rounded-xl font-bold">Read All Posts</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
