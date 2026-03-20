import { List, Grid as GridIcon, Filter, Plus, Play, MoreHorizontal, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

export function Library() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Playlists", "Artists", "Albums", "Downloaded"];

  const items = [
    { id: 1, title: "Midnight City", artist: "M83", type: "Album", cover: "https://picsum.photos/seed/m83/300/300" },
    { id: 2, title: "After Hours", artist: "The Weeknd", type: "Album", cover: "https://picsum.photos/seed/weeknd/300/300" },
    { id: 3, title: "Focus Flow", artist: "Curated by Vynrix", type: "Playlist", cover: "https://picsum.photos/seed/focus/300/300" },
    { id: 4, title: "Chill Beats", artist: "Curated by Vynrix", type: "Playlist", cover: "https://picsum.photos/seed/chill/300/300" },
    { id: 5, title: "Dua Lipa", artist: "Artist", type: "Artist", cover: "https://picsum.photos/seed/dua/300/300" },
    { id: 6, title: "Starboy", artist: "The Weeknd", type: "Album", cover: "https://picsum.photos/seed/starboy/300/300" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-display font-black tracking-tight">Your Library</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
            <button 
              onClick={() => setView("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "grid" ? "bg-zinc-800 text-emerald-500 shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "list" ? "bg-zinc-800 text-emerald-500 shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <Filter className="w-4 h-4 text-zinc-500" />
        </div>
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all",
              filter === f 
                ? "bg-emerald-500 border-emerald-500 text-black" 
                : "bg-zinc-900/50 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="group bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800/50 hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl">
                <img 
                  src={item.cover} 
                  alt={item.title} 
                  className={cn(
                    "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700",
                    item.type === "Artist" ? "rounded-full" : ""
                  )}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Play className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold truncate group-hover:text-emerald-400 transition-colors">{item.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] uppercase tracking-wider font-bold">{item.type}</span>
                <span className="truncate">{item.artist}</span>
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-zinc-800/40 transition-colors cursor-pointer border-b border-zinc-800/30 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.cover} 
                        alt="" 
                        className={cn(
                          "w-12 h-12 object-cover shadow-lg",
                          item.type === "Artist" ? "rounded-full" : "rounded-lg"
                        )} 
                      />
                      <div>
                        <p className="font-bold group-hover:text-emerald-400 transition-colors">{item.title}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          <span className="uppercase tracking-wider font-bold text-[10px]">{item.type}</span>
                          <span>•</span>
                          <span>{item.artist}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-zinc-500 hover:text-emerald-500" />
                      <MoreHorizontal className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
