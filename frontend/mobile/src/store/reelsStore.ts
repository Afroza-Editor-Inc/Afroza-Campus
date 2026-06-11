import { create } from 'zustand';

export interface Reel {
  id: string;
  userName: string;
  userHandle: string;
  caption: string;
  audioLabel: string;
  videoUrl: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface ReelsState {
  reels: Reel[];
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
}

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
];

const MOCK_REELS: Reel[] = [
  {
    id: 'reel_1',
    userName: 'Alice Dupont',
    userHandle: '@alice.campus',
    caption: 'Révisions au coucher du soleil 🌇 #studygram #afrozacampus',
    audioLabel: 'Lo-fi beats · Study session',
    videoUrl: SAMPLE_VIDEOS[0],
    likes: 1240,
    comments: 86,
    shares: 24,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'reel_2',
    userName: 'Club Robotique',
    userHandle: '@robotique',
    caption: 'Notre robot a enfin marché 🤖🔥 Merci à toute l’équipe !',
    audioLabel: 'Son original · Club Robotique',
    videoUrl: SAMPLE_VIDEOS[1],
    likes: 3580,
    comments: 214,
    shares: 142,
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'reel_3',
    userName: 'Bureau des étudiants',
    userHandle: '@bde.officiel',
    caption: 'Teaser de la soirée de gala 🎉 Réservez vos places !',
    audioLabel: 'Afrobeat mix 2026',
    videoUrl: SAMPLE_VIDEOS[2],
    likes: 5120,
    comments: 430,
    shares: 318,
    isLiked: false,
    isSaved: true,
  },
  {
    id: 'reel_4',
    userName: 'Sophie Martin',
    userHandle: '@sophie.dev',
    caption: 'Comment j’organise mes sprints de code en 30s ⏱️ #dev #productivity',
    audioLabel: 'Son original · Sophie Martin',
    videoUrl: SAMPLE_VIDEOS[3],
    likes: 890,
    comments: 52,
    shares: 19,
    isLiked: false,
    isSaved: false,
  },
];

export const useReelsStore = create<ReelsState>((set) => ({
  reels: MOCK_REELS,
  toggleLike: (id) =>
    set((state) => ({
      reels: state.reels.map((reel) =>
        reel.id === id
          ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
          : reel
      ),
    })),
  toggleSave: (id) =>
    set((state) => ({
      reels: state.reels.map((reel) =>
        reel.id === id ? { ...reel, isSaved: !reel.isSaved } : reel
      ),
    })),
}));
