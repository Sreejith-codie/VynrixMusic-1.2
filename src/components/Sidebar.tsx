import { Link, useLocation } from "wouter";
import { Home, Search, Library, PlusSquare, Heart, Music2, Disc, LayoutGrid, ListMusic, Mic2, Radio } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/library", icon: Library, label: "Your Library" },
  ];

  const playlists = [
    "Vibe Check",
    "Late Night Drive",
    "Focus Flow",
    "Chill Beats",
    "Workout Mix",
    "Electronic Dreams",
    "Indie Vibes",
  ];

  return (
    <aside className="w-72 bg-black flex flex-col border-r border-zinc-900/50 h-full relative z-50">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-4 group cursor-pointer">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.6, ease: "anticipate" }}
          className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform"
        >
          <Music2 className="text-black w-6 h-6" />
        </motion.div>
        <h1 className="text-2xl font-display font-black tracking-tighter leading-none group-hover:text-emerald-400 transition-colors">VYNRIX</h1>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1.5">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
              location === item.href
                ? "bg-zinc-900/80 text-white shadow-xl"
                : "text-zinc-500 hover:text-white hover:bg-zinc-900/40"
            )}
          >
            {location === item.href && (
              <motion.div 
                layoutId="activeNav"
                className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full"
              />
            )}
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300 group-hover:scale-110",
              location === item.href ? "text-emerald-500" : "text-zinc-500 group-hover:text-white"
            )} />
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Playlists Section */}
      <div className="mt-10 px-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-600">Your Playlists</h2>
          <button className="text-zinc-600 hover:text-emerald-500 transition-colors hover:rotate-90 duration-300">
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-1 overflow-y-auto scrollbar-hide pr-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white transition-all group rounded-xl hover:bg-zinc-900/30">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Liked Songs</span>
          </button>
          
          <div className="mt-6 space-y-1">
            {playlists.map((playlist) => (
              <Link 
                key={playlist} 
                href={`/playlist/${playlist.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-white hover:bg-zinc-900/30 rounded-xl transition-all group truncate"
              >
                <ListMusic className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                <span className="truncate">{playlist}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Now Playing Widget */}
      <div className="p-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-900/40 backdrop-blur-md rounded-2xl p-4 border border-zinc-800/50 shadow-2xl group cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Disc className="w-6 h-6 text-emerald-500 animate-spin-slow" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Session</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black truncate group-hover:text-emerald-400 transition-colors">Midnight City</p>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">M83 • Electronic</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="h-full bg-emerald-500"
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-600">2:45</span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
