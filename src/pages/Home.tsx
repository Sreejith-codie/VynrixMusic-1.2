import { Play, Heart, MoreHorizontal, Clock3, TrendingUp, Sparkles, Flame, Music, ListPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMusic } from "@/src/lib/api";
import { useAuth, usePlayer } from "../App";
import { toggleLikeSong, subscribeToLikedSongs, LikedSong } from "../lib/db";
import { cn } from "@/src/lib/utils";

export function Home() {
  const { user } = useAuth();
  const { setCurrentTrack, setIsPlaying, addToQueue } = usePlayer();
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

  const handlePlay = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
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
      className="p-4 md:p-8 space-y-8 md:space-y-12"
    >
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden group glass-shiny border border-white/10">
        <img 
          src="https://picsum.photos/seed/concert/1200/400" 
          alt="Hero" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 space-y-2 md:space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            Featured Artist
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">The Weeknd</h1>
          <p className="text-zinc-300 max-w-lg text-sm md:text-lg font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
            Experience the latest album "After Hours" in immersive spatial audio.
          </p>
          <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
            <button className="px-6 md:px-8 py-2 md:py-3 bg-emerald-500 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20 flex items-center gap-2 text-sm md:text-base">
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              Play Now
            </button>
            <button className="px-6 md:px-8 py-2 md:py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/10 text-sm md:text-base">
              Follow
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-display font-bold flex items-center gap-3">
            <Music className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            Browse Categories
          </h2>
          <button className="text-xs md:text-sm font-bold text-zinc-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button key={cat.name} className={`${cat.color} h-20 md:h-24 rounded-2xl p-4 relative overflow-hidden group hover:scale-105 transition-all shadow-lg border border-white/10`}>
              <span className="text-base md:text-lg font-bold text-white relative z-10">{cat.name}</span>
              <div className="absolute -right-4 -bottom-4 w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </button>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-display font-bold flex items-center gap-3">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            Trending Now
          </h2>
          <button className="text-xs md:text-sm font-bold text-zinc-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-white/5 rounded-3xl" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))
          ) : (
            trendingMusic?.map((track: any) => (
              <div 
                key={track.id} 
                onClick={() => handlePlay(track)}
                className="glass-card p-3 md:p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 md:mb-4 shadow-2xl border border-white/5">
                  <img 
                    src={track.cover} 
                    alt={track.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 md:gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                        className="w-9 h-9 md:w-10 md:h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all hover:scale-110 shadow-xl"
                        title="Add to Queue"
                      >
                        <ListPlus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleLike(e, track)}
                        className={cn(
                          "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl",
                          isLiked(track.id) ? "bg-emerald-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                        )}
                      >
                        <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isLiked(track.id) && "fill-current")} />
                      </button>
                      <button 
                        onClick={() => handlePlay(track)}
                        className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform"
                      >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      </button>
                    </div>
                </div>
                <h3 className="text-sm md:text-base font-bold truncate group-hover:text-emerald-400 transition-colors">{track.title}</h3>
                <p className="text-xs md:text-sm text-zinc-500 truncate">{track.artist}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Tracks Table */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-display font-bold flex items-center gap-3">
          <Clock3 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
          Recently Played
        </h2>
        <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
              <thead>
                <tr className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-4 md:px-6 py-4 font-bold">#</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Title</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-right">Time</th>
                  <th className="px-4 md:px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {trendingMusic?.slice(0, 4).map((track: any, i: number) => (
                  <tr 
                    key={track.id} 
                    onClick={() => handlePlay(track)}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-zinc-500 font-mono">{i + 1}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                          <img src={track.cover} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-bold group-hover:text-emerald-400 transition-colors">{track.title}</p>
                          <p className="text-[10px] md:text-xs text-zinc-500">{track.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-zinc-500 font-mono text-right">{track.duration}</td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 md:gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(track);
                          }}
                          className="text-zinc-500 hover:text-emerald-500 transition-colors"
                          title="Add to Queue"
                        >
                          <ListPlus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleLike(e, track)}
                          className={cn(
                            "transition-colors",
                            isLiked(track.id) ? "text-emerald-500" : "text-zinc-500 hover:text-white"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", isLiked(track.id) && "fill-current")} />
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
        </div>
      </section>
    </motion.div>
  );
}
