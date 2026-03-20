import { Link, useLocation } from "wouter";
import { Home, Search, Library, Heart } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/library", icon: Library, label: "Library" },
    { href: "/liked", icon: Heart, label: "Liked" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 glass-morphism border-t-0 rounded-t-3xl">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative",
              location === item.href ? "text-emerald-400" : "text-zinc-500"
            )}
          >
            {location === item.href && (
              <motion.div 
                layoutId="activeNavMobile"
                className="absolute -top-2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
            )}
            <item.icon className={cn(
              "w-6 h-6 transition-transform duration-300",
              location === item.href && "scale-110"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
