import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import yts from "yt-search";
import SpotifyWebApi from "spotify-web-api-node";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.APP_URL ? `${process.env.APP_URL}/api/auth/spotify/callback` : undefined,
});

let ai: GoogleGenAI | null = null;
const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!ai && key && !key.includes('YOUR_')) {
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Spotify Auth
  const getSpotifyToken = async (retries = 3, delay = 1000): Promise<string | null> => {
    try {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || 
          process.env.SPOTIFY_CLIENT_ID.includes('YOUR_') || process.env.SPOTIFY_CLIENT_SECRET.includes('YOUR_')) {
        console.warn("Spotify credentials not set or are placeholders.");
        return null;
      }
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
      return data.body['access_token'];
    } catch (error: any) {
      if (error.statusCode === 429 && retries > 0) {
        const retryAfter = parseInt(error.headers?.['retry-after'] || '1') * 1000;
        console.warn(`Spotify Rate Limited. Retrying after ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter || delay));
        return getSpotifyToken(retries - 1, delay * 2);
      }
      console.error("Spotify Auth Error Details:", {
        message: error.message,
        statusCode: error.statusCode,
        body: error.body
      });
      return null;
    }
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/config", (req, res) => {
    res.json({
      spotifyConfigured: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  app.get("/api/music/trending", async (req, res) => {
    try {
      const results: any = await yts("trending music 2026");
      const tracks = results.videos.slice(0, 10).map((v: any) => ({
        id: v.videoId,
        title: v.title,
        artist: v.author.name,
        cover: v.thumbnail,
        duration: v.timestamp,
        url: v.url
      }));
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending music" });
    }
  });

  app.get("/api/music/search", async (req, res) => {
    const query = req.query.q?.toString() || "";
    if (!query) return res.json([]);

    try {
      const results: any = await yts(query);
      
      // Try to get Spotify metadata if credentials exist
      let spotifyTracks: any[] = [];
      const token = await getSpotifyToken();
      if (token) {
        const spotifyRes = await spotifyApi.searchTracks(query, { limit: 5 });
        spotifyTracks = spotifyRes.body.tracks?.items || [];
      }

      const tracks = results.videos.slice(0, 15).map((v: any) => {
        // Match with Spotify metadata if possible
        const spotifyMatch = spotifyTracks.find(st => 
          st.name.toLowerCase().includes(v.title.toLowerCase().split('(')[0].trim())
        );

        return {
          id: v.videoId,
          title: spotifyMatch?.name || v.title,
          artist: spotifyMatch?.artists[0].name || v.author.name,
          album: spotifyMatch?.album.name || "YouTube Music",
          cover: spotifyMatch?.album.images[0].url || v.thumbnail,
          duration: v.timestamp,
          url: v.url,
          spotifyId: spotifyMatch?.id
        };
      });

      res.json(tracks);
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/music/recommendations", async (req, res) => {
    const { history } = req.body;
    if (!history || history.length === 0) return res.json([]);
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured." });
    }

    try {
      const prompt = `Based on the following search history: ${history.join(", ")}, recommend 5 similar songs. Return only the song names as a comma-separated list.`;
      const aiClient = getAI();
      if (!aiClient) return res.status(500).json({ error: "Gemini API key not configured." });
      
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      const recommendations = response.text.split(",").map(s => s.trim());
      const results = [];

      for (const song of recommendations) {
        const search: any = await yts(song);
        if (search.videos && search.videos[0]) {
          const v = search.videos[0];
          results.push({
            id: v.videoId,
            title: v.title,
            artist: v.author.name,
            cover: v.thumbnail,
            duration: v.timestamp,
            url: v.url
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Recommendation Error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.get("/api/music/playlist/:id", async (req, res) => {
    const { id } = req.params;
    const playlistName = id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    
    try {
      const results: any = await yts(playlistName);
      res.json({
        id,
        name: playlistName,
        description: `A curated selection of ${playlistName} tracks.`,
        cover: results.videos[0]?.thumbnail || `https://picsum.photos/seed/${id}/600/600`,
        tracks: results.videos.slice(0, 10).map((v: any) => ({
          id: v.videoId,
          title: v.title,
          artist: v.author.name,
          cover: v.thumbnail,
          duration: v.timestamp,
          url: v.url
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  });

  app.get("/api/lyrics", async (req, res) => {
    const { title, artist } = req.query;
    if (!title) return res.json({ lyrics: "No track selected." });
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ lyrics: "Lyrics not available (Gemini API key not configured)." });
    }

    try {
      const prompt = `Find or generate the lyrics for the song "${title}" by "${artist}". If you can't find the exact lyrics, provide a poetic summary or the first few lines if known. Format it nicely with line breaks.`;
      const aiClient = getAI();
      if (!aiClient) return res.json({ lyrics: "Lyrics not available (Gemini API key not configured or invalid)." });

      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      res.json({ lyrics: response.text });
    } catch (error: any) {
      console.error("Lyrics Error:", error);
      const errorMessage = error.message?.includes("API_KEY_INVALID") 
        ? "Lyrics not available (Invalid Gemini API key)." 
        : "Lyrics not available for this track.";
      res.json({ lyrics: errorMessage });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    const { title, artist } = req.query;
    if (!title) return res.json({ recommendations: [] });
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ recommendations: [] });
    }

    try {
      const prompt = `Find 5 songs that have the "same vibe" as "${title}" by "${artist}". Return only a JSON array of objects with "title" and "artist" properties. No other text.`;
      const aiClient = getAI();
      if (!aiClient) return res.json({ recommendations: [] });

      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const recs = JSON.parse(response.text);
      const results = [];

      for (const rec of recs) {
        const search: any = await yts(`${rec.title} ${rec.artist}`);
        if (search.videos && search.videos[0]) {
          const v = search.videos[0];
          results.push({
            id: v.videoId,
            title: v.title,
            artist: v.author.name,
            cover: v.thumbnail,
            duration: v.timestamp,
            url: v.url
          });
        }
      }

      res.json({ recommendations: results });
    } catch (error: any) {
      console.error("Vibe Recommendation Error:", error);
      const errorMessage = error.message?.includes("API_KEY_INVALID") 
        ? "Invalid Gemini API key." 
        : "Failed to get recommendations.";
      res.json({ recommendations: [], error: errorMessage });
    }
  });

  // Spotify OAuth Routes
  app.get("/api/auth/spotify/url", (req, res) => {
    const scopes = ['user-read-private', 'user-read-email', 'playlist-read-private', 'user-library-read'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'spotify-auth-state');
    res.json({ url: authorizeURL });
  });

  app.get("/api/auth/spotify/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const data = await spotifyApi.authorizationCodeGrant(code as string);
      const { access_token, refresh_token, expires_in } = data.body;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'SPOTIFY_AUTH_SUCCESS',
                  payload: ${JSON.stringify({ 
                    access_token, 
                    refresh_token, 
                    expires_in,
                    expires_at: Date.now() + (expires_in * 1000)
                  })}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Spotify Callback Error:", error.body || error.message);
      res.status(error.statusCode || 500).json({ 
        error: "Authentication failed",
        details: error.body?.error_description || error.message 
      });
    }
  });

  app.post("/api/auth/spotify/refresh", async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: "No refresh token provided" });

    try {
      const refreshApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      });
      refreshApi.setRefreshToken(refresh_token);
      const data = await refreshApi.refreshAccessToken();
      const { access_token, expires_in } = data.body;
      
      res.json({
        access_token,
        expires_in,
        expires_at: Date.now() + (expires_in * 1000)
      });
    } catch (error: any) {
      console.error("Spotify Refresh Error:", error.body || error.message);
      res.status(error.statusCode || 500).json({ 
        error: "Failed to refresh token",
        details: error.body?.error_description || error.message
      });
    }
  });

  app.get("/api/spotify/playlists", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const userSpotifyApi = new SpotifyWebApi({ accessToken: token });
      const data = await userSpotifyApi.getUserPlaylists();
      res.json(data.body.items);
    } catch (error) {
      console.error("Spotify Playlists Error:", error);
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.get("/api/spotify/playlists/:id/tracks", async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const userSpotifyApi = new SpotifyWebApi({ accessToken: token });
      // Use the recommended /items endpoint instead of /tracks
      const data = await userSpotifyApi.getPlaylistTracks(id);
      res.json(data.body.items);
    } catch (error: any) {
      console.error("Spotify Playlist Tracks Error:", error.body || error.message);
      res.status(error.statusCode || 500).json({ 
        error: "Failed to fetch playlist tracks",
        details: error.body?.error_description || error.message
      });
    }
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
