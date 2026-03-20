import { Search, Bell, User, ChevronLeft, ChevronRight, Settings, LogOut, ExternalLink, ShieldCheck, LogIn } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../App";
import { signInWithGoogle, logout } from "../firebase";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={cn(
      "h-20 px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-500",
      isScrolled ? "bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-900/50 shadow-2xl" : "bg-transparent"
    )}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-900 border border-zinc-800/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => window.history.forward()}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-900 border border-zinc-800/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="relative group ml-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for artists, songs, or podcasts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-96 h-12 bg-zinc-900/40 border border-zinc-800/50 rounded-full pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 hover:bg-zinc-900/60"
          />
        </form>
      </div>

      <div className="flex items-center gap-6">
        <button className="w-11 h-11 rounded-full bg-zinc-900/40 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative border border-zinc-800/50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950" />
        </button>

        <div className="relative">
          {loading ? (
            <div className="w-32 h-10 bg-zinc-900/40 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-zinc-900/40 hover:bg-zinc-800 transition-all border border-zinc-800/50 group"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-9 h-9 rounded-full shadow-xl group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold text-sm shadow-xl group-hover:scale-105 transition-transform">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-bold tracking-tight">{user.displayName || user.email?.split('@')[0]}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 mb-2 border-b border-zinc-800/50">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Account</p>
                      <p className="text-sm font-bold truncate">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                      <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </div>
                      </button>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Privacy</span>
                        </div>
                      </button>
                    </div>

                    <div className="h-px bg-zinc-800/50 my-2 mx-2" />
                    
                    <button 
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-bold">Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
