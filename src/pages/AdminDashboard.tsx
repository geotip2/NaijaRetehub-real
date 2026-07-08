import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Job, Course, Announcement } from '../types';
import { Plus, Trash2, Megaphone, Briefcase, GraduationCap, Save, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'courses' | 'announcements'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newJob, setNewJob] = useState({ title: '', company: '', type: 'Full-time', location: 'Remote', salary: '', category: 'Tech', is_free: false, apply_url: '' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '', is_free: false, content_url: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ message: '', type: 'info' as 'info' | 'warning' | 'success', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: jobsList } = await supabase.from('jobs').select('*');
    const { data: coursesList } = await supabase.from('courses').select('*');
    const { data: announcementsList } = await supabase.from('announcements').select('*');

    setJobs((jobsList || []) as Job[]);
    setCourses((coursesList || []) as Course[]);
    setAnnouncements((announcementsList || []) as Announcement[]);
    setLoading(false);
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await supabase.from('jobs').insert({ ...newJob, posted_at: new Date().toISOString() });
    setNewJob({ title: '', company: '', type: 'Full-time', location: 'Remote', salary: '', category: 'Tech', is_free: false, apply_url: '' });
    fetchData();
    setActionLoading(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await supabase.from('courses').insert(newCourse);
    setNewCourse({ title: '', description: '', thumbnail: '', is_free: false, content_url: '' });
    fetchData();
    setActionLoading(false);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await supabase.from('announcements').insert({ ...newAnnouncement, created_at: new Date().toISOString() });
    setNewAnnouncement({ message: '', type: 'info', is_active: true });
    fetchData();
    setActionLoading(false);
  };

  const handleSeed = async () => {
    if (confirm('Seed initial data? This will add sample jobs and courses.')) {
      setActionLoading(true);
      const { seedSupabase } = await import('../lib/seed');
      await seedSupabase();
      fetchData();
      setActionLoading(false);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Delete this item?')) {
      await supabase.from(coll).delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#008751]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24 pt-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#1A1A1A]">Admin Control</h1>
            <p className="text-gray-500 font-medium">Manage platform content and communications.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-[#008751] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Jobs
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'courses' ? 'bg-[#008751] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Courses
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcements' ? 'bg-[#008751] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Announcements
            </button>
          </div>
          <button 
            onClick={handleSeed}
            disabled={actionLoading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            Seed Initial Data
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-[#008751]" />
                <span>Add {activeTab.slice(0, -1)}</span>
              </h2>

              {activeTab === 'jobs' && (
                <form onSubmit={handleAddJob} className="space-y-4">
                  <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <input placeholder="Company" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <input placeholder="Salary (e.g. ₦800k/mo)" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                  <input placeholder="Apply URL" value={newJob.apply_url} onChange={e => setNewJob({...newJob, apply_url: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={newJob.is_free} onChange={e => setNewJob({...newJob, is_free: e.target.checked})} id="is_free_job" />
                    <label htmlFor="is_free_job">Free Job</label>
                  </div>
                  <button disabled={actionLoading} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-gray-800">Add Job</button>
                </form>
              )}

              {activeTab === 'courses' && (
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <input placeholder="Course Title" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <textarea placeholder="Description" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <input placeholder="Thumbnail URL" value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                  <input placeholder="Content URL" value={newCourse.content_url} onChange={e => setNewCourse({...newCourse, content_url: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={newCourse.is_free} onChange={e => setNewCourse({...newCourse, is_free: e.target.checked})} id="is_free_course" />
                    <label htmlFor="is_free_course">Free Course</label>
                  </div>
                  <button disabled={actionLoading} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-gray-800">Add Course</button>
                </form>
              )}

              {activeTab === 'announcements' && (
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <textarea placeholder="Message" value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
                  <select value={newAnnouncement.type} onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none">
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Gold)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                  <button disabled={actionLoading} className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-gray-800">Post Announcement</button>
                </form>
              )}
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'jobs' && jobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008751]/10 p-2 rounded-lg text-[#008751]"><Briefcase size={20} /></div>
                  <div>
                    <h4 className="font-bold text-sm">{job.title}</h4>
                    <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('jobs', job.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            ))}

            {activeTab === 'courses' && courses.map(course => (
              <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008751]/10 p-2 rounded-lg text-[#008751]"><GraduationCap size={20} /></div>
                  <div>
                    <h4 className="font-bold text-sm">{course.title}</h4>
                    <p className="text-xs text-gray-500">Free: {course.is_free ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('courses', course.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            ))}

            {activeTab === 'announcements' && announcements.map(ann => (
              <div key={ann.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#008751]/10 p-2 rounded-lg text-[#008751]"><Megaphone size={20} /></div>
                  <div>
                    <p className="text-sm font-medium">{ann.message}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{ann.type}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('announcements', ann.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            ))}

            {activeTab === 'jobs' && jobs.length === 0 && <p className="text-center text-gray-400 py-12">No jobs found.</p>}
            {activeTab === 'courses' && courses.length === 0 && <p className="text-center text-gray-400 py-12">No courses found.</p>}
            {activeTab === 'announcements' && announcements.length === 0 && <p className="text-center text-gray-400 py-12">No announcements found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
