import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// FIX: Create local useAuth hook if AuthContext doesn't exist in src
const useAuth = () => {
  // Return dummy user for now - replace with actual auth when available
  return {
    user: {
      id: 'dummy-user-id',
      _id: 'dummy-user-id', 
      username: 'TestUser',
      locationEnabled: true
    }
  };
};

// FIX: Create local interfaces if types folder doesn't exist in src
interface LocationData {
  latitude: number;
  longitude: number;
}

interface Message {
  _id?: string;
  id?: string;
  content: string;
  sender?: {
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  user?: {
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  chatRoom?: string;
  createdAt: string | Date;
}

interface ChatRoom {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  type?: string;
  subType?: string;
  participants?: number;
  distance?: number;
  event?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface SocketContextType {
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

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Socket State
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  
  // UPDATED: Store messages per room
  const [messagesMap, setMessagesMap] = useState<{[roomId: string]: Message[]}>({});
  // For backward compatibility with existing components
  const [messages, setMessages] = useState<Message[]>([]);

  // Location State - KORRIGIERT
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<number | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>('Standort wird ermittelt...');
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);

  // Füge fehlende State-Variablen hinzu
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:1113';
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1113';

  // Location Name Update - DEFINIERE ZUERST
  const updateLocationName = useCallback(async (lat: number, lng: number) => {
    try {
      console.log(`🔍 Fetching location name for: ${lat}, ${lng}`);
      
      const response = await fetch(`${API_BASE_URL}/api/location/name?lat=${lat}&lng=${lng}`, {
        headers:
         {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📍 Location name received: ${data.name}`);
        setCurrentLocationName(data.name);
      } else {
        console.warn('⚠️ Failed to fetch location name');
        setCurrentLocationName('Unbekannter Ort');
      }
    } catch (error) {
      console.error('❌ Error fetching location name:', error);
      setCurrentLocationName('Standort wird ermittelt...');
    }
  }, [API_BASE_URL]);

  // Rooms Functions - NACH updateLocationName
  const fetchNearbyRoomsWithLocation = useCallback(async (lat: number, lng: number) => {
    try {
      console.log('🚀 Fetching LOCAL rooms FAST...');
      
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/chat/rooms/nearby?latitude=${lat}&longitude=${lng}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const roomsData = await response.json();
        console.log('✅ LOCAL rooms loaded INSTANTLY:', roomsData);
        
        if (roomsData.success && roomsData.rooms) {
          console.log(`📦 Setting ${roomsData.rooms.length} rooms in context`);
          
          const formattedRooms = roomsData.rooms.map((room: any) => ({
            ...room,
            id: room._id || room.id,
            _id: room._id || room.id
          }));
          
          setRooms(formattedRooms);
          setChatRooms(formattedRooms);
          
          console.log(`✅ Successfully set ${formattedRooms.length} rooms in SocketContext`);
        } else {
          console.warn('❌ No rooms found in response:', roomsData);
        }
      } else {
        console.error('❌ Failed to fetch nearby rooms, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching nearby rooms:', error);
    }
  }, [API_BASE_URL]);

  // Location Functions - NACH updateLocationName und fetchNearbyRoomsWithLocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      return;
    }

    setIsLocationLoading(true);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log(`📍 PROGRESSIVE update: accuracy ${accuracy}m, coords: ${latitude}, ${longitude}`);
      
      const locationData: LocationData = { latitude, longitude };
      setUserLocation(locationData);
      setLocationAccuracy(accuracy);
      setIsLocationLoading(false);

      updateLocationName(latitude, longitude);
      fetchNearbyRoomsWithLocation(latitude, longitude);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('❌ Geolocation error:', error.message);
      setIsLocationLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [fetchNearbyRoomsWithLocation, updateLocationName]);

  // HYBRID APPROACH: Keep location & rooms, simple chat only
  const connectSocket = useCallback(() => {
    if (!user?.id) return null;

    console.log(`🔗 Connecting simple chat for: ${user.username}`);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('✅ Simple chat connected');
      
      // Simple auth
      newSocket.emit('auth', {
        userId: user.id,
        username: user.username
      });
      
      setSocket(newSocket);
    });

    newSocket.on('auth-success', () => {
      console.log('✅ Simple auth successful');
    });

    newSocket.on('newMessage', (message) => {
      console.log('📬 New message received:', message);
      
      // Only add if it's for current room
      if (message.chatRoom === currentRoom) {
        setMessages(prev => {
          // Check for duplicates
          const isDuplicate = prev.some(m => 
            m._id === message._id || m.id === message.id
          );
          
          if (isDuplicate) {
            console.log('🔄 Duplicate message ignored');
            return prev;
          }
          
          console.log('✅ Adding new message to chat');
          return [...prev, message];
        });
      }
    });

    newSocket.on('joined-room', (data) => {
      console.log('✅ Joined room confirmed via joined-room:', data);
      setCurrentRoom(data.roomId);
      setMessages(data.messages || []);
      
      // Update room user count in UI
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          (room._id === data.roomId || room.id === data.roomId)
            ? { ...room, participants: data.userCount }
            : room
        )
      );
    });

    // ADD ALL OTHER EVENT LISTENERS THE SERVER SENDS!
    newSocket.on('joinedRoom', (data) => {
      console.log('✅ Joined room confirmed via joinedRoom:', data);
      setCurrentRoom(data.roomId);
      setMessages(data.messages || []);
      
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          (room._id === data.roomId || room.id === data.roomId)
            ? { ...room, participants: data.userCount }
            : room
        )
      );
    });

    newSocket.on('roomMessages', (messages) => {
      console.log('✅ Room messages received via roomMessages:', messages);
      setMessages(messages || []);
    });

    newSocket.on('room-joined', (data) => {
      console.log('✅ Joined room confirmed via room-joined:', data);
      setCurrentRoom(data.roomId);
      setMessages(data.messages || []);
    });

    newSocket.on('messages-loaded', (messages) => {
      console.log('✅ Messages loaded via messages-loaded:', messages);
      setMessages(messages || []);
    });

    newSocket.on('room-data', (data) => {
      console.log('✅ Room data received via room-data:', data);
      setCurrentRoom(data.roomId);
      setMessages(data.messages || []);
    });

    return newSocket;
  }, [user, SOCKET_URL, currentRoom]);

  // SIMPLE JOIN ROOM - keep room loading intact
  const joinRoom = useCallback((roomId: string) => {
    console.log('🚪 Joining room:', roomId);
    
    if (!socket) {
      const newSocket = connectSocket();
      setTimeout(() => {
        console.log('🚀 EMITTING join-room event after socket creation');
        newSocket?.emit('join-room', roomId);
      }, 1000);
      return;
    }

    console.log('🚀 EMITTING join-room event to Simple Chat Server');
    socket.emit('join-room', roomId);
    setCurrentRoom(roomId); // Set immediately for UI
  }, [socket, connectSocket]);

  // SIMPLE SEND MESSAGE - WITH BETTER LOGGING
  const sendMessage = useCallback((content: string) => {
    if (!socket || !currentRoom) {
      console.warn('❌ No socket or room for message');
      return;
    }
    
    console.log('📤 EMITTING sendMessage to Simple Chat Server');
    console.log(`📤 Room: ${currentRoom}, Content: "${content}"`);
    socket.emit('sendMessage', { content });
    console.log('✅ sendMessage event emitted successfully');
  }, [socket, currentRoom]);

  // Füge fehlende Dummy-Funktionen hinzu
  const createEventRoom = useCallback(async (eventData: any): Promise<ChatRoom | null> => {
    console.log('🎉 Creating event room:', eventData);
    // TODO: Implementiere Event-Room-Erstellung
    return null;
  }, []);

  // Repariere likeMessage Funktion
  const likeMessage = useCallback(async (messageId: string): Promise<void> => {
    console.log('👍 Liking message:', messageId);
    // TODO: Implementiere Message-Like-Funktionalität
  }, []);

  // Context Value - REPARIERT
  const value: SocketContextType = {
    socket,
    currentRoom,
    userLocation,
    currentLocationName,
    isLocationLoading,
    locationAccuracy,
    joinRoom,
    sendMessage,
    messages,
    rooms,
    chatRooms,
    setRooms,
    setCurrentRoom, // Hinzugefügt
    setMessages, // Hinzugefügt
    user,
    createEventRoom,
    likeMessage
  };

  // Socket Connection Effect - KORRIGIERT mit besserer Auth-Behandlung
  useEffect(() => {
    if (user?.id && !socket) {
      console.log('🔗 Initiating socket connection...');
      
      // Kürzere Wartezeit für neu registrierte User
      const timer = setTimeout(() => {
        connectSocket();
      }, 500); // Nur 500ms statt 2 Sekunden
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, socket, connectSocket]);

  // Progressive Location Detection - SOFORT STARTEN
  useEffect(() => {
    if (!user?.locationEnabled) return;
    
    console.log('📍 Starting IMMEDIATE location detection...');
    
    // SOFORT starten - NICHT von Socket abhängig machen
    getCurrentLocation();
  }, [user?.locationEnabled, getCurrentLocation]); // Entferne socket dependency

  // FORCE LOCATION ON FIRST LOAD - zusätzlicher Effect
  useEffect(() => {
    // Beim allerersten Laden sofort Location abrufen
    if (user?.locationEnabled && rooms.length === 0 && !isLocationLoading) {
      console.log('🚀 FORCING immediate location detection for first load');
      getCurrentLocation();
    }
  }, [user?.locationEnabled, rooms.length, isLocationLoading, getCurrentLocation]);

  // Effect for updating messages when room changes
  useEffect(() => {
    if (currentRoom) {
      const roomMessages = messagesMap[currentRoom] || [];
      setMessages(roomMessages);
    }
  }, [currentRoom, messagesMap]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};