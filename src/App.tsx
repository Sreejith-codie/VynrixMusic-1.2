import { Switch, Route } from "wouter";
import { Sidebar } from "./components/Sidebar";
import { Player } from "./components/Player";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Library } from "./pages/Library";
import { Playlist } from "./pages/Playlist";
import { motion, AnimatePresence } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

const queryClient = new QueryClient();

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading }}>
        <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-24">
              <AnimatePresence mode="wait">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/search" component={Search} />
                  <Route path="/library" component={Library} />
                  <Route path="/playlist/:id" component={Playlist} />
                </Switch>
              </AnimatePresence>
            </main>
            <Player />
          </div>
        </div>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
