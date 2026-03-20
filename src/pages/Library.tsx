import { List, Grid as GridIcon, Filter, Plus, Play, MoreHorizontal, Heart, Music } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { useAuth, usePlayer, useSpotify } from "../App";
import { subscribeToLikedSongs, LikedSong } from "../lib/db";

export function Library() {
  const { user } = useAuth();
  const { setCurrentTrack, setIsPlaying, setQueue } = usePlayer();
  const { spotifyToken, connectSpotify, isConfigured: isSpotifyConfigured } = useSpotify();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const unsubscribeLiked = subscribeToLikedSongs(user.uid, setLikedSongs);
      
      // Fetch user playlists from Firestore
      const fetchUserPlaylists = async () => {
        const { collection, query, where, onSnapshot, orderBy } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        
        const q = query(
          collection(db, "playlists"),
          where("userId", "==", user.uid)
        );
        
        return onSnapshot(q, (snapshot) => {
          const playlists = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: "Playlist"
          })) as any[];
          
          // Sort in memory to avoid index requirement
          playlists.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setUserPlaylists(playlists);
        });
      };

      let unsubscribePlaylists: () => void;
      fetchUserPlaylists().then(unsub => {
        unsubscribePlaylists = unsub;
      });

      return () => {
        unsubscribeLiked();
        if (unsubscribePlaylists) unsubscribePlaylists();
      };
    } else {
      setLikedSongs([]);
      setUserPlaylists([]);
    }
  }, [user]);

  useEffect(() => {
    if (spotifyToken) {
      fetch('/api/spotify/playlists', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSpotifyPlaylists(data);
        }
      })
      .catch(err => console.error("Spotify Fetch Error:", err));
    }
  }, [spotifyToken]);

  const handlePlay = (item: any) => {
    if (item.isSpotify) {
      window.open(`https://open.spotify.com/playlist/${item.id}`, '_blank');
      return;
    }
    
    if (item.tracks && Array.isArray(item.tracks)) {
      const [first, ...rest] = item.tracks;
      setCurrentTrack(first);
      setQueue(rest);
    } else {
      setCurrentTrack(item);
    }
    setIsPlaying(true);
  };

  const filters = ["All", "Playlists", "Artists", "Albums", "Downloaded"];

  const items = [
    ...likedSongs.map(song => ({ ...song, type: "Song" })),
    ...userPlaylists.map(pl => ({
      ...pl,
      title: pl.name,
      artist: "Your Playlist",
      cover: pl.tracks?.[0]?.cover || `https://picsum.photos/seed/${pl.id}/300/300`,
    })),
    ...spotifyPlaylists.map(pl => ({
      id: pl.id,
      title: pl.name,
      artist: pl.owner.display_name,
      cover: pl.images[0]?.url || `https://picsum.photos/seed/${pl.id}/300/300`,
      type: "Playlist",
      isSpotify: true
    }))
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 md:p-8 space-y-6 md:space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight">Your Library</h1>
        
        <div className="flex items-center gap-4">
          {isSpotifyConfigured && !spotifyToken && (
            <button 
              onClick={connectSpotify}
              className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[#1DB954]/20"
            >
              <Music className="w-5 h-5" />
              <span className="hidden sm:inline">Connect Spotify</span>
            </button>
          )}
          
          <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setView("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "grid" ? "bg-white/10 text-emerald-400 shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "list" ? "bg-white/10 text-emerald-400 shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="p-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          <Filter className="w-4 h-4 text-zinc-500" />
        </div>
        {filters.map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all backdrop-blur-md",
              filter === f 
                ? "bg-emerald-500 border-emerald-500 text-black" 
                : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              onClick={() => handlePlay(item)}
              className="group glass-card p-3 md:p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 md:mb-4 shadow-xl">
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
                  <button 
                    onClick={() => handlePlay(item)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold truncate text-sm md:text-base group-hover:text-emerald-400 transition-colors">{item.title}</h3>
              <p className="text-[10px] md:text-xs text-zinc-500 mt-1 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] md:text-[10px] uppercase tracking-wider font-bold">{item.type}</span>
                <span className="truncate">{item.artist}</span>
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody>
              {items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handlePlay(item)}
                  className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                >
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <img 
                        src={item.cover} 
                        alt="" 
                        className={cn(
                          "w-10 h-10 md:w-12 md:h-12 object-cover shadow-lg",
                          item.type === "Artist" ? "rounded-full" : "rounded-lg"
                        )} 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-sm md:text-base group-hover:text-emerald-400 transition-colors">{item.title}</p>
                        <p className="text-[10px] md:text-xs text-zinc-500 flex items-center gap-2">
                          <span className="uppercase tracking-wider font-bold text-[8px] md:text-[10px]">{item.type}</span>
                          <span>•</span>
                          <span className="truncate max-w-[100px] md:max-w-none">{item.artist}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex items-center justify-end gap-3 md:gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-emerald-500 fill-current" />
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
