import { motion } from "motion/react";
import { useAuth } from "../App";
import { User, Mail, Calendar, Settings, LogOut, Shield, Music2, Heart, History, UserCircle } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export function Profile() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <UserCircle className="w-10 h-10 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Not Signed In</h2>
        <p className="text-zinc-400 mb-6">Sign in to access your profile and personalized features.</p>
        <button className="px-8 py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
            alt={user.displayName || "User"}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-950 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight">
            {user.displayName || "Anonymous User"}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Liked Songs", value: "124", icon: Heart, color: "text-red-500" },
          { label: "Playlists", value: "12", icon: Music2, color: "text-emerald-500" },
          { label: "Listening Time", value: "48h", icon: History, color: "text-indigo-500" }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold">Account Security</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <p className="font-semibold">Email Verification</p>
              <p className="text-sm text-zinc-500">{user.emailVerified ? "Verified" : "Not Verified"}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${user.emailVerified ? "bg-emerald-500" : "bg-red-500"}`} />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <p className="font-semibold">Account UID</p>
              <p className="text-sm text-zinc-500 font-mono">{user.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
