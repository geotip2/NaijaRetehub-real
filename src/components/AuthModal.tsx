import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile in users table
          const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            plan: 'free',
            referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referred_by: referralCode,
            total_earned: 0,
          });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
          
          setSuccessMessage('Sign up successful! Please check your email for verification.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/dashboard',
      });
      if (resetError) throw resetError;
      setSuccessMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (googleError) throw googleError;
      // Note: User profile creation for OAuth users usually happens via a database trigger in Supabase
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 font-medium flex items-center gap-2">
                  <CheckCircle size={18} />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008751] outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-bold text-[#008751] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008751] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-[#008751] text-white py-4 rounded-xl font-bold hover:bg-[#007043] transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#008751]/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <span>{mode === 'signup' ? 'Join Now' : 'Sign In'}</span>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400 font-medium">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-4 border border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Google</span>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <p className="text-gray-500 font-medium">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'signup' ? 'login' : 'signup');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#008751] font-bold hover:underline"
                  >
                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
