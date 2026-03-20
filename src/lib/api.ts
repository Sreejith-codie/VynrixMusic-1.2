import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const fetchTrendingMusic = async () => {
  const { data } = await api.get("/music/trending");
  return data;
};

export const searchMusic = async (query: string) => {
  const { data } = await api.get(`/music/search?q=${query}`);
  return data;
};

export const fetchPlaylist = async (id: string) => {
  const { data } = await api.get(`/music/playlist/${id}`);
  return data;
};
