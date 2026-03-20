import { Search as SearchIcon, TrendingUp, Clock, Grid, Play, ListPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMusic } from "@/src/lib/api";
import { usePlayer } from "../App";

export function Search() {
  const [query, setQuery] = useState("");
  const { setCurrentTrack, setIsPlaying, addToQueue } = usePlayer();
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMusic(query),
    enabled: query.length > 0,
  });

  const handlePlay = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const recentSearches = ["M83", "The Weeknd", "Dua Lipa", "Synthwave", "Lo-fi Beats"];
  const trendingSearches = ["After Hours", "Future Nostalgia", "Starboy", "Midnight City"];

  const categories = [
    { name: "Pop", color: "bg-emerald-500" },
    { name: "Hip-Hop", color: "bg-purple-500" },
    { name: "Electronic", color: "bg-blue-500" },
    { name: "Rock", color: "bg-red-500" },
    { name: "Jazz", color: "bg-amber-500" },
    { name: "Classical", color: "bg-zinc-500" },
    { name: "R&B", color: "bg-pink-500" },
    { name: "Indie", color: "bg-indigo-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 md:p-8 space-y-8 md:space-y-12"
    >
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 md:w-6 md:h-6" />
        <input 
          type="text" 
          placeholder="Search for artists, songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full glass-morphism border border-white/10 rounded-full py-4 md:py-5 pl-14 md:pl-16 pr-8 text-base md:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl"
        />
      </div>

      {query ? (
        <section className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-display font-bold">Search Results</h2>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-widest">
              <span>Results from</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">Spotify</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-red-500">YouTube</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-w-4xl mx-auto">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : (
              searchResults?.map((track: any) => (
                <div 
                  key={track.id} 
                  onClick={() => handlePlay(track)}
                  className="group flex items-center gap-4 p-2 md:p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                    <img 
                      src={track.cover} 
                      alt={track.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold truncate group-hover:text-emerald-400 transition-colors">{track.title}</h3>
                    <p className="text-xs md:text-sm text-zinc-500 truncate">{track.artist}</p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                      title="Add to Queue"
                    >
                      <ListPlus className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-zinc-500 font-mono hidden sm:block">
                      {track.duration || "3:45"}
                    </span>
                  </div>
                </div>
              ))
            )}
            {!isLoading && searchResults?.length === 0 && (
              <p className="text-zinc-500 text-center py-12">No results found for "{query}"</p>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Recent & Trending */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg md:text-xl font-display font-bold">Recent Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm font-medium hover:bg-white/10 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg md:text-xl font-display font-bold">Trending Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {trendingSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm font-medium hover:bg-white/10 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Browse All */}
          <section className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg md:text-xl font-display font-bold">Browse All</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((cat) => (
                <button key={cat.name} className={`${cat.color} h-24 md:h-32 rounded-2xl p-4 md:p-6 relative overflow-hidden group hover:scale-105 transition-all shadow-lg text-left border border-white/10`}>
                  <span className="text-base md:text-xl font-bold text-white relative z-10">{cat.name}</span>
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
