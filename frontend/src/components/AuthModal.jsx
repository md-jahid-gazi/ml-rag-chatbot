import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, quickAdminLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, email, password, role);
      } else {
        await login(username, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickAdminLogin();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Register to manage conversations and knowledge' : 'Sign in to access your chat history and admin tools'}
            </p>
          </div>

          {/* Quick Admin Option */}
          <button
            onClick={handleQuickAdmin}
            type="button"
            className="w-full mb-4 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-medium transition"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in as Default Admin (admin / admin123)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase tracking-wider">or credentials</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {error && (
            <div className="my-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Username</label>
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200">
                <User className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Email</label>
                <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200">
                  <Mail className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@bracu.ac.bd"
                    className="bg-transparent outline-none w-full"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Password</label>
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200">
                <Lock className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition mt-4"
            >
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
