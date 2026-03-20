import { useState } from "react";
import { useLocation } from "wouter";
import { auth, signInWithGoogle } from "../firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { motion } from "motion/react";
import { LogIn, Mail, Lock, Chrome, UserCircle } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(new URLSearchParams(window.location.search).get("error") || "");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const guestStartTime = localStorage.getItem("guest_start_time");
      if (guestStartTime) {
        const startTime = parseInt(guestStartTime);
        if (Date.now() - startTime > 3600000) {
          setError("Guest access expired. Please create an account.");
          return;
        }
      } else {
        localStorage.setItem("guest_start_time", Date.now().toString());
      }
      
      await signInAnonymously(auth);
      setLocation("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-morphism p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-zinc-500">Sign in to continue to Vynrix</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full h-12 bg-emerald-500 text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Or continue with</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => signInWithGoogle().then(() => setLocation("/"))}
            className="h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Chrome className="w-5 h-5" />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button 
            onClick={handleGuestLogin}
            className="h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Guest</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <button 
            onClick={() => setLocation("/signup")}
            className="text-emerald-500 font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
