import { create } from 'zustand';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'text';
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  isLiked: boolean;
  isSaved: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userName: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface FeedState {
  posts: Post[];
  comments: Record<string, PostComment[]>;
  stories: any[]; // À définir plus tard
  loading: boolean;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  setLoading: (loading: boolean) => void;
}

const SEED_COMMENTS: Record<string, PostComment[]> = {
  '1': [
    {
      id: 'c1',
      postId: '1',
      userName: 'Bob Martin',
      content: 'Je suis partant pour le café ! ☕ @AliceDupont',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      likes: 2,
      isLiked: false,
    },
    {
      id: 'c2',
      postId: '1',
      userName: 'Claire Leroy',
      content: 'Belle journée en effet #campuslife',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      likes: 1,
      isLiked: true,
    },
  ],
  '2': [
    {
      id: 'c3',
      postId: '2',
      userName: 'Alice Dupont',
      content: 'Je connais un peu #ReactNative, on en parle ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      likes: 4,
      isLiked: false,
    },
  ],
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [
    {
      id: '1',
      userId: 'user1',
      userName: 'Alice Dupont',
      userAvatar: undefined,
      content: 'Super journée au campus ! Le soleil brille et les projets avancent bien. Qui est partant pour un café ? ☕',
      mediaUrls: [],
      mediaType: 'text',
      likes: 12,
      comments: 3,
      shares: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Bob Martin',
      userAvatar: undefined,
      content: 'Nouveau projet de groupe pour le cours d\'informatique. On cherche des devs React Native !',
      mediaUrls: ['https://picsum.photos/400/300?random=1'],
      mediaType: 'image',
      likes: 8,
      comments: 5,
      shares: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isLiked: true,
      isSaved: false,
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Claire Leroy',
      userAvatar: undefined,
      content: 'Vidéo du dernier événement Afroza ! C\'était incroyable de voir tout le monde réuni.',
      mediaUrls: ['https://picsum.photos/400/200?random=2'],
      mediaType: 'video',
      likes: 25,
      comments: 12,
      shares: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      isLiked: false,
      isSaved: true,
    },
  ],
  comments: SEED_COMMENTS,
  stories: [],
  loading: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    })),
  toggleSave: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      ),
    })),
  addComment: (postId, content) =>
    set((state) => {
      const trimmed = content.trim();
      if (!trimmed) return state;
      const comment: PostComment = {
        id: `c-${Date.now()}`,
        postId,
        userName: 'Vous',
        content: trimmed,
        timestamp: new Date(),
        likes: 0,
        isLiked: false,
      };
      return {
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] ?? []), comment],
        },
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        ),
      };
    }),
  toggleCommentLike: (postId, commentId) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: (state.comments[postId] ?? []).map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment
        ),
      },
    })),
  setLoading: (loading) => set({ loading }),
}));