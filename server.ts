import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  const trendingMusic = [
    { id: "1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", cover: "https://picsum.photos/seed/m83/300/300", duration: "4:03" },
    { id: "2", title: "Wait", artist: "M83", album: "Hurry Up, We're Dreaming", cover: "https://picsum.photos/seed/wait/300/300", duration: "5:43" },
    { id: "3", title: "Starboy", artist: "The Weeknd", album: "Starboy", cover: "https://picsum.photos/seed/starboy/300/300", duration: "3:50" },
    { id: "4", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", cover: "https://picsum.photos/seed/blinding/300/300", duration: "3:20" },
    { id: "5", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", cover: "https://picsum.photos/seed/dua/300/300", duration: "3:23" },
  ];

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/music/trending", (req, res) => {
    res.json(trendingMusic);
  });

  app.get("/api/music/search", (req, res) => {
    const query = req.query.q?.toString().toLowerCase() || "";
    const results = trendingMusic.filter(m => 
      m.title.toLowerCase().includes(query) || 
      m.artist.toLowerCase().includes(query)
    );
    res.json(results);
  });

  app.get("/api/music/playlist/:id", (req, res) => {
    const { id } = req.params;
    const playlistName = id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    
    res.json({
      id,
      name: playlistName,
      description: `A curated selection of ${playlistName} tracks for your listening pleasure.`,
      cover: `https://picsum.photos/seed/${id}/600/600`,
      tracks: trendingMusic.map((m, i) => ({
        ...m,
        id: `${id}-track-${i}`,
        duration: `${Math.floor(Math.random() * 3) + 3}:${Math.floor(Math.random() * 50) + 10}`
      }))
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
