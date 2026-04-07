// frontend/shared/data/mock.ts

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  postsCount: number;
}

export interface Post {
  id: string;
  user: User;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
  saved: boolean;
}

export interface Story {
  id: string;
  user: User;
  image: string;
  timestamp: string;
  viewed: boolean;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  members: number;
  isJoined: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar: string;
  followers: number;
  isFollowed: boolean;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Dupont',
    username: 'alice_d',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Étudiante en informatique',
    followers: 150,
    following: 120,
    postsCount: 25,
  },
  {
    id: '2',
    name: 'Bob Martin',
    username: 'bob_m',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Passionné de design',
    followers: 200,
    following: 180,
    postsCount: 30,
  },
  {
    id: '3',
    name: 'Carla Silva',
    username: 'carla_s',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Graphiste et développeuse',
    followers: 320,
    following: 145,
    postsCount: 42,
  },
  {
    id: '4',
    name: 'David Okafor',
    username: 'david_ok',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Étudiant en business',
    followers: 89,
    following: 76,
    postsCount: 18,
  },
  {
    id: '5',
    name: 'Elena Rodriguez',
    username: 'elena_r',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'Passionate about Tech & Education',
    followers: 450,
    following: 200,
    postsCount: 67,
  },
  {
    id: '6',
    name: 'Fatima Hassan',
    username: 'fatima_h',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    bio: 'Ingénieure logiciel',
    followers: 280,
    following: 110,
    postsCount: 34,
  },
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    user: mockUsers[0],
    image: 'https://picsum.photos/400/400?random=1',
    caption: 'Belle journée sur le campus ! 🎓 #AfrozaCampus #StudentLife',
    likes: 45,
    comments: 12,
    timestamp: '2h',
    liked: false,
    saved: false,
  },
  {
    id: '2',
    user: mockUsers[1],
    image: 'https://picsum.photos/400/400?random=2',
    caption: 'Travail en équipe pour le projet final 💻 #TeamWork',
    likes: 32,
    comments: 8,
    timestamp: '4h',
    liked: true,
    saved: true,
  },
  {
    id: '3',
    user: mockUsers[2],
    image: 'https://picsum.photos/400/400?random=3',
    caption: 'Design thinking session pour notre startup 🚀',
    likes: 78,
    comments: 23,
    timestamp: '6h',
    liked: false,
    saved: false,
  },
  {
    id: '4',
    user: mockUsers[3],
    image: 'https://picsum.photos/400/400?random=4',
    caption: 'Conf avec les entrepreneurs du campus 📊',
    likes: 28,
    comments: 5,
    timestamp: '8h',
    liked: false,
    saved: false,
  },
  {
    id: '5',
    user: mockUsers[4],
    image: 'https://picsum.photos/400/400?random=5',
    caption: 'Code review avec la team - Open source is fun! 🔥',
    likes: 156,
    comments: 34,
    timestamp: '10h',
    liked: true,
    saved: false,
  },
  {
    id: '6',
    user: mockUsers[5],
    image: 'https://picsum.photos/400/400?random=6',
    caption: 'Atelier de développement mobile avec React Native',
    likes: 91,
    comments: 19,
    timestamp: '12h',
    liked: false,
    saved: true,
  },
  {
    id: '7',
    user: mockUsers[0],
    image: 'https://picsum.photos/400/400?random=7',
    caption: 'Les amis de la faculté <3 #Squad',
    likes: 112,
    comments: 28,
    timestamp: '14h',
    liked: true,
    saved: false,
  },
  {
    id: '8',
    user: mockUsers[2],
    image: 'https://picsum.photos/400/400?random=8',
    caption: 'Portfolio update! Vérifiez mon dernier travail 🎨',
    likes: 203,
    comments: 45,
    timestamp: '16h',
    liked: false,
    saved: false,
  },
  {
    id: '9',
    user: mockUsers[4],
    image: 'https://picsum.photos/400/400?random=9',
    caption: 'Hackathon winners! 🏆 Merci à tous!',
    likes: 289,
    comments: 67,
    timestamp: '18h',
    liked: true,
    saved: true,
  },
  {
    id: '10',
    user: mockUsers[3],
    image: 'https://picsum.photos/400/400?random=10',
    caption: 'Nouveau projet: Platform pour étudiants africains',
    likes: 76,
    comments: 14,
    timestamp: '20h',
    liked: false,
    saved: false,
  },
  {
    id: '11',
    user: mockUsers[1],
    image: 'https://picsum.photos/400/400?random=11',
    caption: 'Design system v2.0 released 🎉',
    likes: 134,
    comments: 31,
    timestamp: '22h',
    liked: false,
    saved: true,
  },
  {
    id: '12',
    user: mockUsers[5],
    image: 'https://picsum.photos/400/400?random=12',
    caption: 'Mentoring the next generation of developers',
    likes: 87,
    comments: 11,
    timestamp: '1d',
    liked: false,
    saved: false,
  },
];

// Mock Stories
export const mockStories: Story[] = [
  {
    id: '1',
    user: mockUsers[0],
    image: 'https://picsum.photos/400/600?random=101',
    timestamp: '1h',
    viewed: false,
  },
  {
    id: '2',
    user: mockUsers[1],
    image: 'https://picsum.photos/400/600?random=102',
    timestamp: '30m',
    viewed: true,
  },
  {
    id: '3',
    user: mockUsers[2],
    image: 'https://picsum.photos/400/600?random=103',
    timestamp: '1h',
    viewed: false,
  },
  {
    id: '4',
    user: mockUsers[3],
    image: 'https://picsum.photos/400/600?random=104',
    timestamp: '2h',
    viewed: false,
  },
  {
    id: '5',
    user: mockUsers[4],
    image: 'https://picsum.photos/400/600?random=105',
    timestamp: '3h',
    viewed: true,
  },
  {
    id: '6',
    user: mockUsers[5],
    image: 'https://picsum.photos/400/600?random=106',
    timestamp: '4h',
    viewed: false,
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: '1',
    user: mockUsers[0],
    lastMessage: {
      id: '1',
      sender: mockUsers[0],
      text: 'Salut! Ça va? On se voit demain?',
      timestamp: '10m',
      isMe: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    user: mockUsers[2],
    lastMessage: {
      id: '2',
      sender: mockUsers[2],
      text: 'J\'ai revu ton design, quelques retours',
      timestamp: '30m',
      isMe: false,
    },
    unreadCount: 1,
  },
  {
    id: '3',
    user: mockUsers[4],
    lastMessage: {
      id: '3',
      sender: mockUsers[4],
      text: 'L\'api est ready! On peut intégrer',
      timestamp: '1h',
      isMe: false,
    },
    unreadCount: 0,
  },
  {
    id: '4',
    user: mockUsers[1],
    lastMessage: {
      id: '4',
      sender: mockUsers[1],
      text: 'À bientôt 😊',
      timestamp: '2h',
      isMe: true,
    },
    unreadCount: 0,
  },
  {
    id: '5',
    user: mockUsers[3],
    lastMessage: {
      id: '5',
      sender: mockUsers[3],
      text: 'Merci pour ton aide!',
      timestamp: '4h',
      isMe: false,
    },
    unreadCount: 1,
  },
];

// Mock Messages for Chat
export const mockMessages = [
  {
    id: '1',
    sender: mockUsers[0],
    text: 'Salut! Ça va?',
    timestamp: '10:30',
    isMe: false,
  },
  {
    id: '2',
    sender: mockUsers[0],
    text: 'Tu travailles sur le projet?',
    timestamp: '10:31',
    isMe: false,
  },
  {
    id: '3',
    sender: mockUsers[0],
    text: 'On se voit demain pour discuter?',
    timestamp: '10:32',
    isMe: false,
  },
  {
    id: '4',
    sender: mockUsers[0],
    text: 'Bien sûr! 😊',
    timestamp: '10:35',
    isMe: true,
  },
  {
    id: '5',
    sender: mockUsers[0],
    text: 'On peut se retrouver à la café?',
    timestamp: '10:36',
    isMe: true,
  },
  {
    id: '6',
    sender: mockUsers[0],
    text: 'Parfait! À 15h alors',
    timestamp: '10:40',
    isMe: false,
  },
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Club Informatique',
    description: 'Discussions sur la programmation et les projets',
    avatar: 'https://picsum.photos/100/100?random=201',
    members: 50,
    isJoined: true,
  },
  {
    id: '2',
    name: 'Startup Weekend',
    description: 'Entrepreneurship et innovation',
    avatar: 'https://picsum.photos/100/100?random=202',
    members: 120,
    isJoined: true,
  },
  {
    id: '3',
    name: 'Design Lovers',
    description: 'UI/UX et design thinking',
    avatar: 'https://picsum.photos/100/100?random=203',
    members: 75,
    isJoined: false,
  },
  {
    id: '4',
    name: 'Data Science Hub',
    description: 'Machine Learning et analyse de données',
    avatar: 'https://picsum.photos/100/100?random=204',
    members: 89,
    isJoined: true,
  },
];

// Mock Channels
export const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Annonces Campus',
    description: 'Informations officielles de l\'université',
    avatar: 'https://picsum.photos/100/100?random=301',
    followers: 1000,
    isFollowed: true,
  },
  {
    id: '2',
    name: 'Tech News Africa',
    description: 'Dernières actualités de la tech en Afrique',
    avatar: 'https://picsum.photos/100/100?random=302',
    followers: 2500,
    isFollowed: true,
  },
  {
    id: '3',
    name: 'Campus Events',
    description: 'Tous les événements du campus',
    avatar: 'https://picsum.photos/100/100?random=303',
    followers: 800,
    isFollowed: false,
  },
  {
    id: '4',
    name: 'Job Opportunities',
    description: 'Offres d\'emploi et stages',
    avatar: 'https://picsum.photos/100/100?random=304',
    followers: 3200,
    isFollowed: true,
  },
];