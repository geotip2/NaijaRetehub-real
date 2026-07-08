import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, Briefcase, Award, TrendingUp, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white text-[#1A1A1A] sticky top-0 z-50 border-b border-gray-200 shadow-sm h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-[#008751] p-1.5 rounded">
              <span className="text-white text-xl font-bold leading-none">🇳🇬</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#008751]">NaijaRemoteHub</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className="hover:text-[#008751] transition-colors">Home</Link>
            <a href="mailto:naijaremotehub@gmail.com" className="hover:text-[#008751] transition-colors">Contact</a>
            {user ? (
              <>
                <Link to="/dashboard" className="text-[#008751]">Dashboard</Link>
                <Link to="/general" className="hover:text-[#008751] transition-colors">Free Jobs</Link>
                <Link to="/referrals" className="hover:text-[#008751] transition-colors">Referrals</Link>
                {user?.email === 'taiwofasuyi@gmail.com' && (
                  <Link to="/admin" className="hover:text-[#008751] transition-colors">Admin</Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-400 hover:text-gray-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/upgrade" 
                className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Join Now
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-[#1A1A1A] border-b border-[#008751]/20 pb-6 px-4"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="py-2 border-b border-white/5">Home</Link>
              <a href="mailto:naijaremotehub@gmail.com" className="py-2 border-b border-white/5">Contact Admin</a>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="py-2 border-b border-white/5 flex items-center space-x-2">
                    <Briefcase size={18} /> <span>Dashboard</span>
                  </Link>
                  <Link to="/general" onClick={() => setIsOpen(false)} className="py-2 border-b border-white/5 flex items-center space-x-2">
                    <TrendingUp size={18} /> <span>Free Jobs</span>
                  </Link>
                  <Link to="/referrals" onClick={() => setIsOpen(false)} className="py-2 border-b border-white/5 flex items-center space-x-2">
                    <Award size={18} /> <span>Referrals</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="py-2 text-red-500 flex items-center space-x-2"
                  >
                    <LogOut size={18} /> <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/upgrade" 
                  onClick={() => setIsOpen(false)}
                  className="bg-[#008751] text-white px-6 py-3 rounded-xl font-medium text-center"
                >
                  Join Membership
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
