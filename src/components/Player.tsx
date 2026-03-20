import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, ListMusic, Heart, VolumeX, Volume1, X, Music, Sparkles, MoreHorizontal, Trash2, Save, GripVertical, ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence, Reorder } from "motion/react";
import ReactPlayer from "react-player";
import { usePlayer } from "../App";
import Markdown from "react-markdown";

export function Player() {
  const ReactPlayerComp = ReactPlayer as any;
  const { 
    currentTrack, 
    setCurrentTrack, 
    isPlaying, 
    setIsPlaying, 
    queue, 
    setQueue,
    removeFromQueue, 
    clearQueue,
    reorderQueue,
    saveQueueAsPlaylist,
    playNext, 
    lyrics,
    recommendations,
    addToQueue
  } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showVibe, setShowVibe] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (showLyrics) {
      setShowQueue(false);
      setShowVibe(false);
    }
  }, [showLyrics]);

  useEffect(() => {
    if (showQueue) {
      setShowLyrics(false);
      setShowVibe(false);
    }
  }, [showQueue]);

  useEffect(() => {
    if (showVibe) {
      setShowLyrics(false);
      setShowQueue(false);
    }
  }, [showVibe]);

  useEffect(() => {
    setIsReady(false);
  }, [currentTrack?.id]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const handleProgress = (state: any) => {
    setPlayed(state.played);
    setProgress(state.played * 100);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleSavePlaylist = async () => {
    const name = prompt("Enter playlist name:", "My Queue");
    if (name) {
      setIsSaving(true);
      const success = await saveQueueAsPlaylist(name);
      setIsSaving(false);
      if (success) {
        alert("Playlist saved successfully!");
      } else {
        alert("Failed to save playlist. Are you logged in?");
      }
    }
  };

  if (!currentTrack) return null;

  return (
    <footer className={cn(
      "glass-morphism border border-white/10 px-4 md:px-6 flex items-center justify-between fixed z-50 transition-all duration-700 ease-in-out",
      "bottom-[100px] left-4 right-4 h-16 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]", // Mobile
      "md:bottom-0 md:left-0 md:right-0 md:h-24 md:rounded-none md:border-t md:border-x-0 md:border-b-0", // Desktop
      isExpanded && "h-full bottom-0 left-0 right-0 rounded-none border-none bg-black/40 backdrop-blur-0"
    )}>
      {/* Atmospheric Background for Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[-1] overflow-hidden"
          >
            <motion.div 
              animate={{ 
                scale: [1.1, 1.2, 1.1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-40 saturate-150"
              style={{ backgroundImage: `url(${currentTrack.cover})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Player - Fixed for sound */}
      <div className="fixed top-0 left-0 w-1 h-1 opacity-[0.001] pointer-events-none overflow-hidden z-[-1]">
        <ReactPlayerComp
          ref={playerRef}
          url={currentTrack.url}
          playing={isPlaying && isReady}
          volume={isMuted ? 0 : volume / 100}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={playNext}
          onReady={() => setIsReady(true)}
          onStart={() => setIsReady(true)}
          onError={(e: any) => console.error("Player Error:", e)}
          playsinline={true}
          config={{
            youtube: {
              rel: 0
            }
          }}
        />
      </div>

      {isExpanded ? (
        <div className="w-full h-full flex flex-col items-center p-6 md:p-12 relative overflow-y-auto scrollbar-hide">
          {/* Header Controls */}
          <div className="w-full max-w-4xl flex justify-between items-center mb-8 md:mb-12">
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mb-1">Playing from</span>
              <span className="text-xs font-bold tracking-widest uppercase">Queue</span>
            </div>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-lg flex flex-col items-center">
            {/* Album Art */}
            <motion.div 
              layoutId="player-art"
              className="aspect-square w-full max-w-[300px] md:max-w-[380px] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 mb-12 md:mb-16"
            >
              <img 
                src={currentTrack.cover} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Track Info */}
            <div className="w-full flex items-center justify-between mb-8">
              <div className="space-y-2 min-w-0 flex-1">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight truncate leading-tight">{currentTrack.title}</h2>
                <p className="text-zinc-400 text-xl md:text-2xl truncate font-medium">{currentTrack.artist}</p>
              </div>
              <button className="ml-6 p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                <Heart className="w-7 h-7 group-hover:fill-emerald-400 group-hover:text-emerald-400 transition-all" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-4 mb-12">
              <div className="flex-1 group relative h-1.5 bg-white/5 rounded-full cursor-pointer overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.8)]" 
                  style={{ width: `${progress}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={(e) => {
                    const newProgress = parseInt(e.target.value);
                    setProgress(newProgress);
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(newProgress / 100);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <div className="flex justify-between text-[10px] md:text-xs font-mono font-bold text-zinc-500 tracking-widest">
                <span>{formatTime(played * duration)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="w-full flex items-center justify-between mb-16">
              <button className="text-zinc-600 hover:text-white transition-colors">
                <Shuffle className="w-6 h-6" />
              </button>
              <button className="text-zinc-300 hover:text-white transition-colors">
                <SkipBack className="w-10 h-10 fill-current" />
              </button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? (
                  <Pause className="w-12 h-12 fill-current" />
                ) : (
                  <Play className="w-12 h-12 fill-current ml-2" />
                )}
              </motion.button>
              <button 
                onClick={playNext}
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <SkipForward className="w-10 h-10 fill-current" />
              </button>
              <button className="text-zinc-600 hover:text-white transition-colors">
                <Repeat className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex items-center justify-center gap-8 md:gap-12">
              <button 
                onClick={() => setShowLyrics(!showLyrics)}
                className={cn(
                  "flex flex-col items-center gap-3 transition-all",
                  showLyrics ? "text-emerald-400 scale-110" : "text-zinc-600 hover:text-white"
                )}
              >
                <Sparkles className="w-7 h-7" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lyrics</span>
              </button>
              <button 
                onClick={() => setShowQueue(!showQueue)}
                className={cn(
                  "flex flex-col items-center gap-3 transition-all",
                  showQueue ? "text-emerald-400 scale-110" : "text-zinc-600 hover:text-white"
                )}
              >
                <ListMusic className="w-7 h-7" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Queue</span>
              </button>
              <button 
                onClick={() => setShowVibe(!showVibe)}
                className={cn(
                  "flex flex-col items-center gap-3 transition-all",
                  showVibe ? "text-emerald-400 scale-110" : "text-zinc-600 hover:text-white"
                )}
              >
                <Heart className="w-7 h-7" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vibe</span>
              </button>
              <div className="flex flex-col items-center gap-3 text-zinc-600 group">
                <div className="flex items-center gap-4 w-28">
                  <Volume2 className="w-5 h-5" />
                  <div className="flex-1 h-1 bg-white/5 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40" style={{ width: `${volume}%` }} />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volume</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Current Track Info */}
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-1/3">
            <motion.div 
              layoutId="player-art"
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-lg md:rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer border border-white/10"
            >
              <img 
                src={currentTrack.cover} 
                alt="Track Cover" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div 
              className="flex flex-col min-w-0 flex-1 md:flex-none cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <h4 className="text-xs md:text-sm font-bold hover:text-emerald-400 truncate transition-colors">{currentTrack.title}</h4>
              <p className="text-[10px] md:text-xs text-zinc-500 hover:text-zinc-300 transition-colors truncate">{currentTrack.artist}</p>
            </div>
            <button className="text-zinc-500 hover:text-emerald-500 transition-colors">
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setShowVibe(!showVibe)}
              className={cn(
                "p-2 rounded-lg transition-colors hidden md:block",
                showVibe ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              <Sparkles className="w-4 h-4" />
            </button>
            
            {/* Mobile Play Button */}
            <button 
              onClick={togglePlay}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          </div>

          {/* Player Controls - Hidden on Mobile */}
          <div className="hidden md:flex flex-col items-center gap-2 w-1/3 max-w-xl">
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
              <button 
                onClick={playNext}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
              <button className="text-zinc-500 hover:text-emerald-500 transition-colors">
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">{formatTime(played * duration)}</span>
              <div className="flex-1 group relative h-1.5 bg-white/10 rounded-full cursor-pointer">
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={(e) => {
                    const newProgress = parseInt(e.target.value);
                    setProgress(newProgress);
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      playerRef.current.seekTo(newProgress / 100);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Extra Controls - Hidden on Mobile */}
          <div className="hidden md:flex items-center justify-end gap-6 w-1/3">
            <button 
              onClick={() => setShowQueue(!showQueue)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showQueue ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
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
              <div className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group/vol">
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
              </div>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Lyrics Overlay */}
      <AnimatePresence>
        {showLyrics && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bottom-24 bg-zinc-950/95 backdrop-blur-3xl z-40 p-8 md:p-16 overflow-y-auto scrollbar-hide"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter">Lyrics</h2>
                  <p className="text-zinc-400 text-xl">{currentTrack.title} — {currentTrack.artist}</p>
                </div>
                <button 
                  onClick={() => setShowLyrics(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="text-2xl md:text-4xl font-display font-medium leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {lyrics ? (
                  <div className="markdown-body">
                    <Markdown>{lyrics}</Markdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-20 text-zinc-600">
                    <Sparkles className="w-12 h-12 animate-pulse" />
                    <p>Fetching lyrics with AI...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 bottom-24 w-full md:w-96 bg-zinc-900/95 backdrop-blur-2xl z-40 border-l border-white/10 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-emerald-500" />
                Queue
              </h2>
              <button 
                onClick={() => setShowQueue(false)}
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <button 
                onClick={handleSavePlaylist}
                disabled={queue.length === 0 || isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save as Playlist"}
              </button>
              <button 
                onClick={clearQueue}
                disabled={queue.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 rounded-lg text-xs font-bold text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>

            <Reorder.Group 
              axis="y" 
              values={queue} 
              onReorder={reorderQueue}
              className="flex-1 overflow-y-auto scrollbar-hide space-y-2"
            >
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-6">
                  <Music className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your queue is empty.</p>
                </div>
              ) : (
                queue.map((track) => (
                  <Reorder.Item 
                    key={track.id} 
                    value={track}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div 
                      className="flex-1 flex items-center gap-3 min-w-0"
                      onClick={() => {
                        setCurrentTrack(track);
                        removeFromQueue(track.id);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={track.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{track.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
                          {track.duration && (
                            <>
                              <span className="text-[8px] text-zinc-700">•</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{track.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(track.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Reorder.Item>
                ))
              )}
            </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Vibe Overlay */}
      <AnimatePresence>
        {showVibe && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 bottom-24 w-full md:w-96 bg-zinc-900/95 backdrop-blur-2xl z-40 border-l border-white/10 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Vibe
              </h2>
              <button 
                onClick={() => setShowVibe(false)}
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-6">Recommended tracks based on your current vibe.</p>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-6">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20 animate-pulse" />
                  <p>Finding the perfect vibe...</p>
                </div>
              ) : (
                recommendations.map((track) => (
                  <div 
                    key={track.id} 
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div 
                      className="flex-1 flex items-center gap-3 min-w-0"
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={track.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{track.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
                          {track.duration && (
                            <>
                              <span className="text-[8px] text-zinc-700">•</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{track.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToQueue(track)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
