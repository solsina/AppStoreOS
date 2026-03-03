import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, LogIn, LogOut, LayoutDashboard, Zap, Rocket, Radar, Cpu, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight leading-none text-white">AppStoreOS</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Mobile App Factory</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/radar')}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border ${isActive('/radar') ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'}`}
          >
            <Radar size={18} />
            <span>Radar</span>
          </button>

          <button 
            onClick={() => navigate('/war-room')}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border ${isActive('/war-room') ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'}`}
          >
            <Rocket size={18} />
            <span>War Room</span>
          </button>

          {user && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/5"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Zap size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-amber-400">50 Crédits</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                )}
                <span className="text-sm font-medium text-gray-300">{user.displayName}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                title="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                console.log("Login button clicked");
                login();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              <LogIn size={18} />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
