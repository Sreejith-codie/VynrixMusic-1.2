import { db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, getDoc } from "firebase/firestore";

export interface LikedSong {
  id: string;
  title: string;
  artist: string;
  cover: string;
  userId: string;
  likedAt: number;
}

export const toggleLikeSong = async (userId: string, song: { id: string, title: string, artist: string, cover: string }) => {
  const songRef = doc(db, `users/${userId}/likedSongs`, song.id);
  const songSnap = await getDoc(songRef);

  if (songSnap.exists()) {
    await deleteDoc(songRef);
    return false;
  } else {
    await setDoc(songRef, {
      ...song,
      userId,
      likedAt: Date.now()
    });
    return true;
  }
};

export const subscribeToLikedSongs = (userId: string, callback: (songs: LikedSong[]) => void) => {
  const q = query(collection(db, `users/${userId}/likedSongs`));
  return onSnapshot(q, (snapshot) => {
    const songs = snapshot.docs.map(doc => doc.data() as LikedSong);
    callback(songs);
  });
};
