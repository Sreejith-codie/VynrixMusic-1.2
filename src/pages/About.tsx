import { motion } from "motion/react";
import { Info, Github, Twitter, Globe, Heart, Music2, Shield, Zap } from "lucide-react";

export function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 max-w-4xl mx-auto"
    >
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6 glass-morphism">
          <Music2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Vynrix Music</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          A next-generation music experience blending the power of YouTube with the elegance of glassmorphism design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-semibold">Our Mission</h3>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Vynrix aims to provide a seamless, high-fidelity music streaming experience that's completely free and open. We believe music should be accessible to everyone, everywhere.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-semibold">Privacy First</h3>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Your data belongs to you. Vynrix doesn't track your listening habits for advertising. We use minimal data only to improve your personal experience.
          </p>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl mb-12">
        <h2 className="text-2xl font-bold mb-6">Features</h2>
        <ul className="space-y-4">
          {[
            "Vast library powered by YouTube",
            "Metadata enrichment via Spotify API",
            "AI-powered 'Same Vibe' recommendations",
            "Real-time lyrics synchronization",
            "Customizable glassmorphism UI",
            "Cross-platform synchronization"
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-4">
          <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <Globe className="w-6 h-6" />
          </a>
        </div>
        <p className="text-zinc-500 text-sm flex items-center gap-2">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Vynrix Team
        </p>
      </div>
    </motion.div>
  );
}
