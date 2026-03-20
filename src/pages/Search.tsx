import { Search as SearchIcon, TrendingUp, Clock, Grid, Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMusic } from "@/src/lib/api";

export function Search() {
  const [query, setQuery] = useState("");
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMusic(query),
    enabled: query.length > 0,
  });

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
      className="p-8 space-y-12"
    >
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-6 h-6" />
        <input 
          type="text" 
          placeholder="Search for artists, songs, or albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-full py-5 pl-16 pr-8 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-zinc-900 transition-all shadow-2xl"
        />
      </div>

      {query ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-display font-bold">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-square bg-zinc-800 rounded-3xl" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                </div>
              ))
            ) : (
              searchResults?.map((track: any) => (
                <div key={track.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800/60 transition-all group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
                    <img 
                      src={track.cover} 
                      alt={track.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
            {!isLoading && searchResults?.length === 0 && (
              <p className="text-zinc-500 col-span-full text-center py-12">No results found for "{query}"</p>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Recent & Trending */}
          <div className="grid md:grid-cols-2 gap-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-display font-bold">Recent Searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-5 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-display font-bold">Trending Searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {trendingSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="px-5 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Browse All */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-display font-bold">Browse All</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <button key={cat.name} className={`${cat.color} h-32 rounded-2xl p-6 relative overflow-hidden group hover:scale-105 transition-all shadow-lg text-left`}>
                  <span className="text-xl font-bold text-white relative z-10">{cat.name}</span>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
