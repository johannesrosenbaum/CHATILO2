import { Socket } from 'socket.io-client';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface Message {
  _id?: string;
  id?: string;
  content: string;
  sender?: {  // ADD sender property
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  user?: {  // Keep user for backwards compatibility
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  chatRoom?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  likes?: string[];
  type?: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface ChatRoom {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  type?: string;
  subType?: string;  // ADD subType property
  location?: {
    type: string;
    coordinates: [number, number];
  };
  distance?: number;
  distanceKm?: number;
  participants?: number;
  isPublic?: boolean;
  maxParticipants?: number;
  radius?: number;
  placeType?: string;
  createdAt?: string | Date;
  isActive?: boolean;
  event?: {  // ADD event property
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    maxParticipants?: number;
  };
}

export interface SocketContextType {
  socket: any;
  currentRoom: string | null;
  userLocation: LocationData | null;
  currentLocationName: string;
  isLocationLoading: boolean;
  locationAccuracy: number | null;
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  messages: Message[];
  rooms: ChatRoom[];
  chatRooms: ChatRoom[];
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  user: any;
  createEventRoom: (eventData: any) => Promise<ChatRoom | null>;
  likeMessage: (messageId: string) => Promise<void>;
}
