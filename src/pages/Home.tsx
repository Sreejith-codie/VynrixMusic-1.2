import { Play, Heart, MoreHorizontal, Clock3, TrendingUp, Sparkles, Flame, Music } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMusic } from "@/src/lib/api";
import { useAuth } from "../App";
import { toggleLikeSong, subscribeToLikedSongs, LikedSong } from "../lib/db";
import { cn } from "@/src/lib/utils";

export function Home() {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToLikedSongs(user.uid, setLikedSongs);
      return () => unsubscribe();
    } else {
      setLikedSongs([]);
    }
  }, [user]);

  const isLiked = (songId: string) => likedSongs.some(s => s.id === songId);

  const handleLike = async (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    if (!user) {
      alert("Please sign in to like songs!");
      return;
    }
    await toggleLikeSong(user.uid, {
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.cover
    });
  };

  const { data: trendingMusic, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingMusic,
  });

  const categories = [
    { name: "Pop", color: "bg-emerald-500" },
    { name: "Hip-Hop", color: "bg-purple-500" },
    { name: "Electronic", color: "bg-blue-500" },
    { name: "Rock", color: "bg-red-500" },
    { name: "Jazz", color: "bg-amber-500" },
    { name: "Classical", color: "bg-zinc-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 space-y-12"
    >
      {/* Hero Section */}
      <section className="relative h-80 rounded-3xl overflow-hidden group">
        <img 
          src="https://picsum.photos/seed/concert/1200/400" 
          alt="Hero" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Featured Artist
          </div>
          <h1 className="text-6xl font-display font-black tracking-tighter">The Weeknd</h1>
          <p className="text-zinc-300 max-w-lg text-lg font-medium leading-relaxed">
            Experience the latest album "After Hours" in immersive spatial audio.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20 flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Play Now
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/10">
              Follow
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <Music className="w-6 h-6 text-emerald-500" />
            Browse Categories
          </h2>
          <button className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button key={cat.name} className={`${cat.color} h-24 rounded-2xl p-4 relative overflow-hidden group hover:scale-105 transition-all shadow-lg`}>
              <span className="text-lg font-bold text-white relative z-10">{cat.name}</span>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </button>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Trending Now
          </h2>
          <button className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-zinc-800 rounded-3xl" />
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))
          ) : (
            trendingMusic?.map((track: any) => (
              <div key={track.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800/60 transition-all group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
                  <img 
                    src={track.cover} 
                    alt={track.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={(e) => handleLike(e, track)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl",
                        isLiked(track.id) ? "bg-emerald-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isLiked(track.id) && "fill-current")} />
                    </button>
                    <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold truncate group-hover:text-emerald-400 transition-colors">{track.title}</h3>
                <p className="text-sm text-zinc-500 truncate">{track.artist}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Tracks Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <Clock3 className="w-6 h-6 text-emerald-500" />
          Recently Played
        </h2>
        <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800/50">
                <th className="px-6 py-4 font-bold">#</th>
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-6 py-4 font-bold text-right">Time</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {trendingMusic?.slice(0, 4).map((track: any, i: number) => (
                <tr key={track.id} className="group hover:bg-zinc-800/40 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden">
                        <img src={track.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{track.title}</p>
                        <p className="text-xs text-zinc-500">{track.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 font-mono text-right">{track.duration}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-zinc-500 hover:text-emerald-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
