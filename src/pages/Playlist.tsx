import { Play, Heart, MoreHorizontal, Clock3, Share2, Download, Search, ListMusic, Music } from "lucide-react";
import { useParams } from "wouter";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaylist } from "@/src/lib/api";
import { cn } from "@/src/lib/utils";
import { usePlayer } from "../App";

export function Playlist() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { setCurrentTrack, setIsPlaying } = usePlayer();
  
  const { data: playlist, isLoading } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id || ""),
    enabled: !!id,
  });

  const handlePlay = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      handlePlay(playlist.tracks[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row items-end gap-8">
          <div className="w-64 h-64 bg-zinc-800 rounded-3xl" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-zinc-800 rounded w-24" />
            <div className="h-16 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
          </div>
        </div>
        <div className="h-12 bg-zinc-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative pb-32"
    >
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent -z-10" />
      
      <div className="p-4 md:p-8 pt-8 md:pt-12 space-y-6 md:space-y-8">
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
          <div className="w-48 h-48 md:w-64 md:h-64 glass-card rounded-3xl shadow-2xl overflow-hidden group relative border border-white/10">
            <img 
              src={playlist?.cover} 
              alt={playlist?.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={handlePlayAll}
                className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl"
              >
                <Play className="w-7 h-7 md:w-8 md:h-8 fill-current" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 md:space-y-4 w-full">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">Public Playlist</span>
            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter leading-tight md:leading-none">{playlist?.name}</h1>
            <p className="text-sm md:text-base text-zinc-400 font-medium line-clamp-2 md:line-clamp-none">{playlist?.description}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm font-medium text-zinc-300">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-[8px] md:text-[10px]">RP</div>
              <span className="hover:underline cursor-pointer">Rajan Prasanna</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span>{playlist?.tracks.length} songs</span>
              <span className="hidden sm:inline w-1 h-1 bg-zinc-700 rounded-full" />
              <span className="hidden sm:inline text-zinc-500">about 2 hr 30 min</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between py-2 md:py-4">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={handlePlayAll}
              className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl shadow-emerald-500/20"
            >
              <Play className="w-6 h-6 md:w-7 md:h-7 fill-current" />
            </button>
            <button className="text-zinc-400 hover:text-emerald-500 transition-colors">
              <Heart className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button className="hidden sm:block text-zinc-400 hover:text-white transition-colors">
              <Download className="w-6 h-6" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition-colors">
              <span>Custom Order</span>
              <ListMusic className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-1">
          <div className="grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_1fr_1fr_100px_40px] gap-4 px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">
            <span>#</span>
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span className="text-right flex items-center justify-end gap-1">
              <Clock3 className="w-4 h-4" />
            </span>
            <span className="hidden md:block"></span>
          </div>
          
          {playlist?.tracks.map((track: any, i: number) => (
            <div 
              key={track.id} 
              onClick={() => handlePlay(track)}
              className="grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_1fr_1fr_100px_40px] gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer items-center"
            >
              <span className="text-xs md:text-sm font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors">
                <span className="group-hover:hidden">{i + 1}</span>
                <Play className="w-4 h-4 hidden group-hover:block fill-current" />
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                  <img src={track.cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">{track.title}</p>
                  <p className="text-[10px] md:text-xs text-zinc-500 truncate hover:underline">{track.artist}</p>
                </div>
              </div>
              <span className="hidden md:block text-sm text-zinc-400 truncate hover:underline">{track.album}</span>
              <span className="text-xs md:text-sm font-mono text-zinc-500 text-right">{track.duration}</span>
              <div className="hidden md:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-zinc-500 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
