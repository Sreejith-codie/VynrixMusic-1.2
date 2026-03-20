import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, ListMusic, Heart, VolumeX, Volume1 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <footer className="h-24 bg-black/95 backdrop-blur-xl border-t border-zinc-900/50 px-6 flex items-center justify-between fixed bottom-0 left-0 right-0 z-50">
      {/* Current Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer"
        >
          <img 
            src="https://picsum.photos/seed/music/200/200" 
            alt="Track Cover" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </motion.div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold hover:text-emerald-400 cursor-pointer truncate transition-colors">Midnight City</h4>
          <p className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors truncate">M83</p>
        </div>
        <button className="ml-4 text-zinc-500 hover:text-emerald-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl">
        <div className="flex items-center gap-6">
          <button className="text-zinc-500 hover:text-emerald-500 transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl shadow-white/10 hover:bg-emerald-500 hover:text-black transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 text-black fill-current ml-0.5" />
            )}
          </motion.button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-zinc-500 hover:text-emerald-500 transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">1:24</span>
          <div className="flex-1 group relative h-1.5 bg-zinc-800 rounded-full cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all" 
              style={{ width: `${progress}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono w-10">4:03</span>
        </div>
      </div>

      {/* Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-6 w-1/3">
        <button className="text-zinc-500 hover:text-white transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 group w-32">
          <button onClick={toggleMute} className="text-zinc-500 group-hover:text-white transition-colors">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 50 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative cursor-pointer group/vol">
            <div 
              className="absolute top-0 left-0 h-full bg-zinc-400 group-hover:bg-emerald-500 rounded-full transition-all" 
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseInt(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-xl opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${isMuted ? 0 : volume}% - 5px)` }}
            />
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
