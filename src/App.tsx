import { Switch, Route } from "wouter";
import { Sidebar } from "./components/Sidebar";
import { Player } from "./components/Player";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Library } from "./pages/Library";
import { Playlist } from "./pages/Playlist";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { motion, AnimatePresence } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { cn } from "@/src/lib/utils";

const queryClient = new QueryClient();

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);

// Player Context
interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  queue: Track[];
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  reorderQueue: (newQueue: Track[]) => void;
  saveQueueAsPlaylist: (name: string) => Promise<boolean>;
  playNext: () => void;
  lyrics: string | null;
  setLyrics: (lyrics: string | null) => void;
  recommendations: Track[];
  setRecommendations: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  queue: [],
  setQueue: () => {},
  addToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
  reorderQueue: () => {},
  saveQueueAsPlaylist: async () => false,
  playNext: () => {},
  lyrics: null,
  setLyrics: () => {},
  recommendations: [],
  setRecommendations: () => {},
});

export const usePlayer = () => useContext(PlayerContext);

// Spotify Context
interface SpotifyTokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

interface SpotifyContextType {
  spotifyToken: string | null;
  setSpotifyToken: (token: string | null) => void;
  connectSpotify: () => Promise<void>;
  isConfigured: boolean;
  refreshSpotifyToken: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType>({
  spotifyToken: null,
  setSpotifyToken: () => {},
  connectSpotify: async () => {},
  isConfigured: false,
  refreshSpotifyToken: async () => {},
});

export const useSpotify = () => useContext(SpotifyContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(localStorage.getItem("spotify_access_token"));
  const [isSpotifyConfigured, setIsSpotifyConfigured] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setIsSpotifyConfigured(data.spotifyConfigured))
      .catch(() => setIsSpotifyConfigured(false));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Check guest expiration
      if (user?.isAnonymous) {
        const guestStartTime = localStorage.getItem("guest_start_time");
        if (guestStartTime) {
          const startTime = parseInt(guestStartTime);
          if (Date.now() - startTime > 3600000) {
            auth.signOut();
            localStorage.removeItem("guest_start_time");
            setLocation("/login?error=Guest session expired");
            return;
          }
        }
      }

      // Redirect to login if not authenticated and not on auth pages
      if (!user && location !== "/login" && location !== "/signup") {
        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [location]);

  const refreshSpotifyToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return;

    try {
      const response = await fetch('/api/auth/spotify/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSpotifyToken(data.access_token);
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_expires_at', data.expires_at.toString());
      } else {
        // If refresh fails, clear tokens
        setSpotifyToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_expires_at');
      }
    } catch (error) {
      console.error("Failed to refresh Spotify token", error);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const expiresAt = localStorage.getItem('spotify_expires_at');
      if (expiresAt && spotifyToken) {
        const timeLeft = parseInt(expiresAt) - Date.now();
        if (timeLeft < 300000) { // Refresh if less than 5 minutes left
          await refreshSpotifyToken();
        }
      }
    };

    const interval = setInterval(checkToken, 60000); // Check every minute
    checkToken();
    return () => clearInterval(interval);
  }, [spotifyToken]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        const { access_token, refresh_token, expires_at } = event.data.payload;
        setSpotifyToken(access_token);
        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('spotify_refresh_token', refresh_token);
        localStorage.setItem('spotify_expires_at', expires_at.toString());
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectSpotify = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      const { url } = await response.json();
      window.open(url, 'spotify_auth', 'width=600,height=800');
    } catch (error) {
      console.error("Failed to get Spotify auth URL", error);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(t => t.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const reorderQueue = (newQueue: Track[]) => {
    setQueue(newQueue);
  };

  const saveQueueAsPlaylist = async (name: string) => {
    if (!user) return false;
    try {
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("./firebase");
      
      const tracksToSave = currentTrack ? [currentTrack, ...queue] : queue;
      
      await addDoc(collection(db, "playlists"), {
        name,
        userId: user.uid,
        tracks: tracksToSave,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error saving playlist:", error);
      return false;
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setCurrentTrack(nextTrack);
      setQueue(prev => prev.slice(1));
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (currentTrack) {
      // Fetch lyrics when track changes
      setLyrics(null);
      fetch(`/api/lyrics?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`)
        .then(res => res.json())
        .then(data => setLyrics(data.lyrics))
        .catch(() => setLyrics("Lyrics not available for this track."));
      
      // Fetch recommendations (vibe)
      fetch(`/api/recommendations?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`)
        .then(res => res.json())
        .then(data => {
          if (data.recommendations) {
            setRecommendations(data.recommendations);
            if (queue.length === 0) {
              // Auto-populate queue if empty
              setQueue(data.recommendations);
            }
          }
        })
        .catch(console.error);
    }
  }, [currentTrack]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading }}>
        <SpotifyContext.Provider value={{ 
          spotifyToken, 
          setSpotifyToken, 
          connectSpotify, 
          isConfigured: isSpotifyConfigured,
          refreshSpotifyToken
        }}>
          <PlayerContext.Provider value={{ 
            currentTrack, 
            setCurrentTrack, 
            isPlaying, 
            setIsPlaying,
            queue,
            setQueue,
            addToQueue,
            removeFromQueue,
            clearQueue,
            reorderQueue,
            saveQueueAsPlaylist,
            playNext,
            lyrics,
            setLyrics,
            recommendations,
            setRecommendations
          }}>
          <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
          {/* Background Atmospheric Gradients */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
          </div>

          {!["/login", "/signup"].includes(location) && (
            <div className="hidden md:block">
              <Sidebar />
            </div>
          )}
          
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {!["/login", "/signup"].includes(location) && <Header />}
            <main className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide",
              !["/login", "/signup"].includes(location) ? "pb-32 md:pb-24" : ""
            )}>
              <AnimatePresence mode="wait">
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/" component={Home} />
                  <Route path="/search" component={Search} />
                  <Route path="/library" component={Library} />
                  <Route path="/playlist/:id" component={Playlist} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/about" component={About} />
                </Switch>
              </AnimatePresence>
            </main>
            {!["/login", "/signup"].includes(location) && <Player />}
            {!["/login", "/signup"].includes(location) && <BottomNav />}
          </div>
        </div>
        </PlayerContext.Provider>
        </SpotifyContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
