export interface User {
  _id: string;
  id?: string; // Alias für _id für Kompatibilität
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  avatar?: string; // Alias für profileImage
  bio?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationEnabled?: boolean; // Für Standort-Berechtigung
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    theme: 'dark' | 'light' | 'auto';
  };
  createdAt: Date;
  lastSeen: Date;
  isOnline: boolean;
  isVerified: boolean;
}

export interface ChatRoom {
  _id?: string;
  name: string;
  type: 'local' | 'regional' | 'event' | 'school' | 'university' | 'location' | 'global';
  address?: {
    city?: string;
    village?: string;
    town?: string;
    [key: string]: any;
  };
  memberCount?: number;
  category?: string;
  radius?: number;
  createdAt?: string;
  updatedAt?: string;
  users?: any[];
  messages?: any[];
  description?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  expiresAt?: Date; // for event rooms
  isActive: boolean;
  lastMessage?: {
    content: string;
    timestamp: Date;
    userId: string;
  };
  settings?: any;
  tags?: string[];
  coverImage?: string;
}

export interface Message {
  _id: string;
  chatRoomId: string;
  userId: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaMetadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
    mimeType?: string;
  };
  replyTo?: {
    messageId: string;
    content: string;
    userId: string;
    username: string;
  };
  likes: string[]; // array of user IDs
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  timestamp: Date;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  radius: number;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  chatRoomId: string;
  isActive: boolean;
  coverImage?: string;
  tags: string[];
  maxParticipants?: number;
  currentParticipants: number;
}

export interface School {
  _id: string;
  name: string;
  type: 'school' | 'university' | 'college';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  chatRoomId: string;
  isActive: boolean;
  studentCount?: number;
  website?: string;
  description?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'message' | 'like' | 'mention' | 'event' | 'system';
  title: string;
  message: string;
  data?: {
    chatRoomId?: string;
    messageId?: string;
    eventId?: string;
    userId?: string;
  };
  isRead: boolean;
  createdAt: Date;
}

export interface ChatRoomMember {
  userId: string;
  chatRoomId: string;
  joinedAt: Date;
  lastSeen: Date;
  isActive: boolean;
  role: 'member' | 'moderator' | 'admin';
  preferences: {
    notifications: boolean;
    muted: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SocketEvents {
  // Connection events
  'user:connect': (userId: string) => void;
  'user:disconnect': (userId: string) => void;
  
  // Chat events
  'message:send': (message: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>) => void;
  'message:receive': (message: Message) => void;
  'message:edit': (messageId: string, content: string) => void;
  'message:delete': (messageId: string) => void;
  'message:like': (messageId: string, userId: string) => void;
  'message:unlike': (messageId: string, userId: string) => void;
  
  // Room events
  'room:join': (chatRoomId: string, userId: string) => void;
  'room:leave': (chatRoomId: string, userId: string) => void;
  'room:typing': (chatRoomId: string, userId: string, isTyping: boolean) => void;
  'room:member:join': (chatRoomId: string, user: User) => void;
  'room:member:leave': (chatRoomId: string, userId: string) => void;
  
  // User events
  'user:status': (userId: string, status: 'online' | 'offline' | 'away') => void;
  'user:typing': (chatRoomId: string, userId: string, isTyping: boolean) => void;
  
  // Notification events
  'notification:new': (notification: Notification) => void;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  activeChatRoom: ChatRoom | null;
  chatRooms: ChatRoom[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>; // chatRoomId -> userIds
  favoriteRooms: string[]; // ⭐ Favoriten-RoomIDs
  messagesPagination: Record<string, { // 📄 Pagination pro Raum
    currentPage: number;
    hasMore: boolean;
    isLoading: boolean;
    totalMessages: number;
  }>;
}

export interface LocationState {
  currentLocation: Location | null;
  nearbyChatRooms: ChatRoom[];
  nearbySchools?: any[]; // Schools from OpenStreetMap
  userLocations?: Location[]; // Gespeicherte Benutzer-Standorte
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  chat: ChatState;
  location: LocationState;
  notifications: Notification[];
  theme: 'dark' | 'light' | 'auto';
  sidebarOpen: boolean;
}

export interface CreateEventData {
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: {
      street?: string;
      city: string;
      state?: string;
      country: string;
      postalCode?: string;
    };
  };
  radius: number;
  startDate: Date;
  endDate: Date;
  coverImage?: File;
  tags: string[];
  maxParticipants?: number;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: File;
  preferences?: {
    notifications?: boolean;
    privacy?: 'public' | 'friends' | 'private';
    theme?: 'dark' | 'light' | 'auto';
  };
} 