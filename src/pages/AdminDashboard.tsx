import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Job, Course, Announcement } from '../types';
import { Plus, Trash2, Megaphone, Briefcase, GraduationCap, Save, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'courses' | 'announcements' | 'users'>('users');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // Form states
  const [newJob, setNewJob] = useState({ title: '', company: '', type: 'Full-time', location: 'Remote', salary: '', category: 'Tech', is_free: false, apply_url: '' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '', is_free: false, content_url: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ message: '', type: 'info' as 'info' | 'warning' | 'success', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: jobsList } = await supabase.from('jobs').select('*');
      const { data: coursesList } = await supabase.from('courses').select('*');
      const { data: announcementsList } = await supabase.from('announcements').select('*');
      const { data: usersList } = await supabase.from('users').select('*').order('created_at', { ascending: false });

      setJobs((jobsList || []) as Job[]);
      setCourses((coursesList || []) as Course[]);
      setAnnouncements((announcementsList || []) as Announcement[]);
      setUsers(usersList || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
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
    setConfirmModal({
      isOpen: true,
      title: 'Seed Initial Data',
      message: 'Are you sure you want to seed initial data? This will add sample jobs and courses.',
      onConfirm: async () => {
        setActionLoading(true);
        const { seedSupabase } = await import('../lib/seed');
        await seedSupabase();
        fetchData();
        setActionLoading(false);
        setConfirmModal(null);
      }
    });
  };

  const handleDelete = async (coll: string, id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      onConfirm: async () => {
        await supabase.from(coll).delete().eq('id', id);
        fetchData();
        setConfirmModal(null);
      }
    });
  };

  const handleBanUser = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ban User',
      message: 'Are you sure you want to ban this user? They will no longer be able to access the platform.',
      onConfirm: async () => {
        await supabase.from('users').delete().eq('id', id); // Simplified ban as delete for this example, could be an is_banned flag
        fetchData();
        setConfirmModal(null);
      }
    });
  };

  const handleChangePlan = async (id: string, newPlan: string, currentPlan: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Change Membership Plan',
      message: `Are you sure you want to change this user's plan from ${currentPlan} to ${newPlan}?`,
      onConfirm: async () => {
        await supabase.from('users').update({ plan: newPlan }).eq('id', id);
        fetchData();
        setConfirmModal(null);
      }
    });
  };

  const filteredUsers = users.filter(user => 
    (user.full_name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#008751]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24 pt-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1A1A1A]">Admin Control</h1>
            <p className="text-gray-500 font-medium mt-2">Manage platform content, users, and communications.</p>
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
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-[#008751] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Users & Payments
            </button>
          </div>
        </header>

        {/* Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-[#1A1A1A]">{users.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Jobs</p>
            <h3 className="text-3xl font-black text-blue-600">{jobs.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Courses</p>
            <h3 className="text-3xl font-black text-purple-600">{courses.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est Revenue</p>
            <h3 className="text-3xl font-black text-[#008751]">
              ₦{(
                users.filter(u => u.plan === 'starter').length * 8000 +
                users.filter(u => u.plan === 'pro').length * 15000 +
                users.filter(u => u.plan === 'lifetime').length * 80000
              ).toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button 
            onClick={handleSeed}
            disabled={actionLoading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm flex items-center gap-2"
          >
            {actionLoading && <Loader2 className="animate-spin" size={16} />}
            Seed Initial Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          {activeTab !== 'users' && (
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
          )}

          {/* List Column */}
          <div className={activeTab === 'users' ? "lg:col-span-3 space-y-4" : "lg:col-span-2 space-y-4"}>
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

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Total Users</p>
                    <h3 className="text-3xl font-black text-[#1A1A1A]">{users.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Starter (₦8k)</p>
                    <h3 className="text-3xl font-black text-blue-600">
                      {users.filter(u => u.plan === 'starter').length}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Pro (₦15k)</p>
                    <h3 className="text-3xl font-black text-purple-600">
                      {users.filter(u => u.plan === 'pro').length}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Lifetime (₦80k)</p>
                    <h3 className="text-3xl font-black text-amber-600">
                      {users.filter(u => u.plan === 'lifetime').length}
                    </h3>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                    <div>
                      <h3 className="font-bold text-lg">Members & Signups</h3>
                      <div className="text-sm font-bold text-[#008751]">
                        Estimated Revenue: ₦{(
                          users.filter(u => u.plan === 'starter').length * 8000 +
                          users.filter(u => u.plan === 'pro').length * 15000 +
                          users.filter(u => u.plan === 'lifetime').length * 80000
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 outline-none focus:border-[#008751]"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Plan</th>
                        <th className="px-6 py-4 font-semibold">Total Earned</th>
                        <th className="px-6 py-4 font-semibold">Joined</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#1A1A1A]">{user.full_name || 'No Name Provided'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={user.plan || 'free'}
                              onChange={(e) => handleChangePlan(user.id, e.target.value, user.plan)}
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer border-none appearance-none text-center ${
                                (user.plan || 'free') === 'free' ? 'bg-gray-100 text-gray-600' :
                                user.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                                user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                                'bg-amber-100 text-amber-700'
                              }`}
                            >
                              <option value="free">FREE</option>
                              <option value="starter">STARTER</option>
                              <option value="pro">PRO</option>
                              <option value="lifetime">LIFETIME</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 font-medium">₦{user.total_earned?.toLocaleString() || 0}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors"
                            >
                              Profile
                            </button>
                            <button 
                              onClick={() => handleBanUser(user.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Ban
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {activeTab === 'jobs' && jobs.length === 0 && <p className="text-center text-gray-400 py-12">No jobs found.</p>}
            {activeTab === 'courses' && courses.length === 0 && <p className="text-center text-gray-400 py-12">No courses found.</p>}
            {activeTab === 'announcements' && announcements.length === 0 && <p className="text-center text-gray-400 py-12">No announcements found.</p>}
            {activeTab === 'users' && users.length === 0 && <p className="text-center text-gray-400 py-12">No users found.</p>}
          </div>
        </div>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-black text-[#1A1A1A] mb-2">{confirmModal.title}</h3>
              <p className="text-gray-500">{confirmModal.message}</p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-[#1A1A1A]">User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 uppercase">
                  {(selectedUser.full_name || selectedUser.email).charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedUser.full_name || 'No Name Provided'}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    (selectedUser.plan || 'free') === 'free' ? 'bg-gray-100 text-gray-600' :
                    selectedUser.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                    selectedUser.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedUser.plan || 'free'} Member
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Joined</p>
                  <p className="font-medium text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Earned</p>
                  <p className="font-medium text-sm text-[#008751]">₦{selectedUser.total_earned?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Referral Code</p>
                  <p className="font-medium text-sm font-mono">{selectedUser.referral_code || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Referred By</p>
                  <p className="font-medium text-sm font-mono">{selectedUser.referred_by || 'None'}</p>
                </div>
              </div>

              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
