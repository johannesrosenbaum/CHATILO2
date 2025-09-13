// c:\Users\Johannes\CHATILO2\chatilo-app\src\contexts\SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useParams } from 'react-router-dom';

// Types
export interface Message {
  _id?: string;
  id?: string;
  content: string;
  userId: string;
  username: string;
  timestamp: Date;
  createdAt: Date;
  roomId: string;
  chatRoom?: string;
  user?: {
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  sender?: {
    _id?: string;
    id?: string;
    username: string;
    avatar?: string;
  };
  type?: 'text' | 'image' | 'video' | 'gif';
  mediaUrl?: string;
  mediaMetadata?: {
    filename?: string;
    size?: number;
    duration?: number;
    width?: number;
    height?: number;
  };
}

export interface ChatRoom {
  _id?: string;
  id?: string;
  name: string;
  type?: 'location' | 'event' | 'global';
  subType?: 'regional' | 'city' | 'neighborhood' | 'general' | 'global'; // 'global' ergänzt
  participants: number;
  description?: string;
  lastMessage?: any;
  // KORRIGIERT: Flexible location property - unterstützt beide Formate
  location?: {
    type?: string;
    coordinates?: [number, number];
    address?: string;
    city?: string;
    radius?: number;
    latitude?: number;  // Alternative Format
    longitude?: number; // Alternative Format
  };
  distance?: number;
  event?: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
  };
  createdBy?: string;
  isActive?: boolean;
  lastActivity?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface SocketContextType {
  socket: Socket | null;
  currentRoom: string | null;
  roomId: string | null;
  userLocation: LocationData | null;
  currentLocationName: string;
  isLocationLoading: boolean;
  locationAccuracy: number | null;
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string, mediaData?: { type: 'image' | 'video' | 'gif', url: string, file?: File }) => void;
  messages: Message[];
  rooms: ChatRoom[];
  chatRooms: ChatRoom[];
  roomMessages: Record<string, Message[]>;
  isLoadingMessages: boolean;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  user: any;
  createEventRoom: (eventData: any) => Promise<ChatRoom | null>;
  likeMessage: (messageId: string) => Promise<void>;
  loadRoomMessages: (roomId: string) => Promise<void>;
  uploadMedia: (file: File, type: 'image' | 'video') => Promise<string | null>;
  isRoomsLoading: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
  roomId?: string;
}

export const SocketProvider = ({ children, roomId }: SocketProviderProps) => {
  console.log('🔧 STABLE: SocketProvider render with roomId (PROP!):', roomId);
  console.log('🔧 STABLE: SocketProvider roomId type:', typeof roomId);
  console.log('🔧 STABLE: SocketProvider roomId length:', roomId?.length);
  console.log('🔧 STABLE: SocketProvider roomId truthy:', !!roomId);
  
  const { user } = useAuth();
  // Entferne: const { roomId: routeRoomId } = useParams<{ roomId: string }>();

  // REFS für stabile Werte
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // STATE - minimiert
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>('Unknown Location');
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  // STATE für besseres Message Management
  const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState<boolean>(false);

  // Socket-URL für Entwicklung und Produktion
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://chatilo.de';
  console.log('🌐 [DEBUG] SOCKET_URL:', SOCKET_URL);

  // API-URL immer relativ
  const getApiUrl = () => '';

  // STABLE FUNCTIONS - KEINE DEPENDENCIES AUF SOCKET!
  const updateLocationName = useCallback(async (latitude: number, longitude: number) => {
    if (!mountedRef.current) return;
    
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      const locationName = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
      
      if (mountedRef.current) {
        setCurrentLocationName(locationName);
        console.log(`📍 Location updated: ${locationName}`);
      }
    } catch (error) {
      console.error('❌ Location name error:', error);
      if (mountedRef.current) {
        setCurrentLocationName('Unknown Location');
      }
    }
  }, []);

  // Fetch all public rooms (fallback if location fails)
  const fetchAllPublicRooms = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      let token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`/api/chat/rooms?limit=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok && mountedRef.current) {
        const data = await response.json();
        const allRooms = data.rooms || [];
        console.log(`🏠 Fallback: FOUND ${allRooms.length} public rooms (no location):`);
        setChatRooms(allRooms);
      } else {
        console.error('❌ Fallback: Failed to fetch public rooms:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Fallback: Error fetching public rooms:', error);
    }
  }, []);

  const fetchNearbyRoomsWithLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!mountedRef.current) return;
    setIsRoomsLoading(true);
    
    try {
      // 🔥 KORRIGIERTE TOKEN-VALIDIERUNG - prüfe Token-Gültigkeit ZUERST
      let token = localStorage.getItem('token');
      console.log(`🔧 DEBUG: fetchNearbyRoomsWithLocation called`);
      console.log(`   Initial token available: ${!!token}`);
      console.log(`   Initial token length: ${token?.length || 0}`);
      console.log(`   Token preview: ${token ? token.substring(0, 20) + '...' : 'none'}`);
      console.log(`   Coordinates: ${latitude}, ${longitude}`);
      console.log(`   Component mounted: ${mountedRef.current}`);
      
      if (!token || !mountedRef.current) {
        console.log('❌ No token available or component unmounted for nearby rooms API');
        return;
      }

      // 🔥 TOKEN-VALIDIERUNG: Teste Token mit /auth/me vor dem Rooms-Call
      console.log(`🔐 VALIDATING token before rooms API call...`);
      
      const validateResponse = await fetch(`/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`🔐 Token validation status: ${validateResponse.status}`);
      
      if (validateResponse.status === 401) {
        console.log(`🔐 TOKEN INVALID - attempting fresh login...`);
        
        // Token ist ungültig - versuche einen frischen Token zu bekommen
        // Das passiert normalerweise automatisch durch AuthContext
        // Warte kurz und versuche es erneut
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Hole frischen Token
        token = localStorage.getItem('token');
        console.log(`🔐 Fresh token available: ${!!token}`);
        console.log(`🔐 Fresh token length: ${token?.length || 0}`);
        
        if (!token) {
          console.log('❌ Still no valid token after refresh attempt');
          return;
        }
        
        // Validiere frischen Token
        const freshValidateResponse = await fetch(`/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🔐 Fresh token validation status: ${freshValidateResponse.status}`);
        
        if (freshValidateResponse.status === 401) {
          console.log('❌ Fresh token also invalid - giving up');
          return;
        }
      } else if (validateResponse.ok) {
        const userData = await validateResponse.json();
        console.log(`✅ Token valid - user: ${userData.username || userData.user?.username || 'unknown'}`);
      }

      console.log(`🌍 FETCHING nearby rooms with VALIDATED token...`);
      
      const response = await fetch(`/api/chat/rooms/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude, radius: 10000 })
      });

      console.log(`🔧 DEBUG: Rooms API Response status: ${response.status}`);
      console.log(`   Response ok: ${response.ok}`);
      
      console.log('🟡 [DEBUG] Vor roomsArray-Analyse');
      if (response.ok && mountedRef.current) {
        const data = await response.json();
        // Noch robusteres Array-Handling
        let roomsArray = [];
        console.log(
          'DEBUG rooms:', 
          data.rooms, 
          'typeof:', typeof data.rooms, 
          'isArray:', Array.isArray(data.rooms), 
          'constructor:', data.rooms && data.rooms.constructor && data.rooms.constructor.name
        );
        if (Array.isArray(data.rooms)) {
          roomsArray = data.rooms;
        } else if (
          data.rooms &&
          typeof data.rooms === 'object' &&
          typeof data.rooms.length === 'number' &&
          data.rooms.length > 0
        ) {
          // Falls es ein Array-ähnliches Objekt ist (z.B. mit length, aber kein echtes Array)
          roomsArray = Array.from(data.rooms);
        } else if (data.rooms && typeof data.rooms === 'object') {
          roomsArray = Object.values(data.rooms);
        } else {
          roomsArray = [];
        }
        console.log('roomsArray:', roomsArray, 'length:', roomsArray.length, 'isArray:', Array.isArray(roomsArray));
        setRooms(roomsArray);
        setChatRooms(roomsArray);
        setTimeout(() => {
          console.log('🟢 [DEBUG] State nach setRooms:', rooms);
          console.log('🟢 [DEBUG] State nach setChatRooms:', chatRooms);
        }, 500);
        // NEU: Wenn keine Räume gefunden wurden, initialisiere persistente Räume
        if (roomsArray.length === 0) {
          console.log('⚠️ [LOOP-DEBUG] roomsArray.length === 0 -> Initialisiere persistente Räume per POST...');
          const postResponse = await fetch(`/api/chat/rooms/nearby`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude, radius: 10000 })
          });
          if (postResponse.ok) {
            const postData = await postResponse.json();
            const newRooms = postData.rooms || postData.data || postData || [];
            console.log('🟡 [DEBUG] POST-Response:', postData);
            console.log('🟡 [DEBUG] typeof newRooms:', typeof newRooms);
            console.log('🟡 [DEBUG] Object.keys(newRooms):', newRooms && Object.keys(newRooms));
            console.log('🟡 [DEBUG] newRooms.constructor:', newRooms && newRooms.constructor && newRooms.constructor.name);
            setRooms(newRooms);
            setChatRooms(newRooms);
            console.log(`✅ Persistente Nearby-Räume initialisiert: ${newRooms.length} Räume`);
            // IMMER: Räume nach POST nochmal per GET laden
            const getResponse = await fetch(`/api/chat/rooms/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (getResponse.ok) {
              const fetchedRooms = await getResponse.json();
              const roomsArray = fetchedRooms.rooms || fetchedRooms.data || fetchedRooms || [];
              console.log('🟡 [DEBUG] GET-Response nach POST:', fetchedRooms);
              console.log('🟡 [DEBUG] typeof roomsArray (nach POST-GET):', typeof roomsArray);
              console.log('🟡 [DEBUG] Object.keys(roomsArray) (nach POST-GET):', roomsArray && Object.keys(roomsArray));
              console.log('🟡 [DEBUG] roomsArray.constructor (nach POST-GET):', roomsArray && roomsArray.constructor && roomsArray.constructor.name);
              setRooms(roomsArray);
              setChatRooms(roomsArray);
              console.log(`✅ Räume nach Initialisierung per GET geladen: ${roomsArray.length} Räume`);
            } else {
              console.error('❌ Fehler beim GET nach Initialisierung:', getResponse.status, getResponse.statusText);
            }
          } else {
            console.error('❌ Fehler beim Initialisieren persistenter Räume:', postResponse.status, postResponse.statusText);
          }
        } else {
          console.log('🟢 [LOOP-DEBUG] roomsArray.length > 0, kein Loop!');
        }
      } else {
        console.error(`❌ Nearby rooms API STILL failed after token validation:`);
        console.error(`   Status: ${response.status}`);
        console.error(`   Status Text: ${response.statusText}`);
        console.log('🟠 Fehlerfall erreicht');
        try {
          const errorText = await response.text();
          console.error(`   Response body: ${errorText}`);
        } catch (e) {
          console.error(`   Could not read response body`);
        }
      }
    } catch (error) {
      console.error('❌ CRITICAL: Token validation or nearby rooms fetch error:');
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      console.log('🔴 Fehler im catch-Block!');
    } finally {
      setIsRoomsLoading(false);
      console.log('🟢 finally-Block erreicht');
    }
  }, []);

  // KORRIGIERTE JOIN ROOM - verwende ORIGINAL Room-ID
  const joinRoom = useCallback((roomId: string) => {
    console.log('🚪 🔥 CRITICAL: Joining room:', roomId); // Verwende Original roomId
    
    if (!socketRef.current) {
      console.log('❌ No socket for join');
      return;
    }
    
    // 🔥 ERWEITERTE SOCKET CONNECTION PRÜFUNG
    console.log('🔧 SOCKET CONNECTION STATUS:');
    console.log('   Socket exists:', !!socketRef.current);
    console.log('   Socket connected:', socketRef.current?.connected);
    console.log('   Socket id:', socketRef.current?.id);
    console.log('   Socket transport:', socketRef.current?.io?.engine?.transport?.name);
    
    // 🔥 WARTE AUF CONNECTION wenn nötig
    if (!socketRef.current.connected) {
      console.log('⏳ WAITING for socket connection...');
      socketRef.current.on('connect', () => {
        console.log('✅ DELAYED: Socket connected, now joining room');
        socketRef.current?.emit('join-room', roomId); // Original roomId verwenden
      });
      return;
    }
    
    // 🔥 CRITICAL: Setze currentRoom SOFORT, nicht erst nach joined-room Event
    console.log('🔥 SETTING currentRoom IMMEDIATELY to:', roomId);
    setCurrentRoom(roomId);
    
    // 🔥 ERWEITERTE JOIN-ROOM EMISSION mit DEBUGGING
    console.log('🔥 EMITTING join-room event:', roomId);
    socketRef.current.emit('join-room', roomId); // Original roomId verwenden
    
    // 🔥 KORRIGIERTER TIMEOUT - prüfe currentRoom state, nicht lokale Variable
    setTimeout(() => {
      console.log('🔥 TIMEOUT CHECK: Join room status');
      console.log('   Target room:', roomId);
      console.log('   Socket connected:', socketRef.current?.connected);
      console.log('   Component mounted:', mountedRef.current);
      
      // 🔥 NUR RETRY wenn Socket noch verbunden und Component mounted
      if (socketRef.current?.connected && mountedRef.current) {
        console.log('✅ Socket still connected - join should be successful');
      } else {
        console.log('❌ Socket disconnected or component unmounted');
      }
    }, 3000);
    
  }, []); // 🔥 NO dependencies to prevent recreation

  // Erweiterte sendMessage Funktion für Media
  const sendMessage = useCallback((content: string, mediaData?: { type: 'image' | 'video' | 'gif', url: string, file?: File }) => {
    if (!socketRef.current || !currentRoom || !user) return;

    const messageData = {
      content,
      chatRoom: currentRoom,
      roomId: currentRoom,
      userId: user.id || user._id,
      username: user.username,
      timestamp: new Date(),
      type: mediaData ? mediaData.type : 'text',
      mediaUrl: mediaData?.url
    };

    console.log('📤 Sending message:', messageData);
    socketRef.current.emit('sendMessage', messageData);
  }, [currentRoom, user]);

  // STABLE DUMMY FUNCTIONS
  const createEventRoom = useCallback(async (eventData: any): Promise<ChatRoom | null> => {
    console.log('🎉 Creating event room:', eventData);
    return null;
  }, []);

  const likeMessage = useCallback(async (messageId: string): Promise<void> => {
    console.log('👍 Liking message:', messageId);
  }, []);

  // Nachrichten für spezifischen Raum laden
  const loadRoomMessages = useCallback(async (roomId: string) => {
    if (!roomId || isLoadingMessages) return;
    
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_URL = getApiUrl();
      console.log(`📝 Loading messages for room: ${roomId}`);

      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const roomMessagesData = await response.json();
        console.log(`✅ Loaded ${roomMessagesData.length} messages for room ${roomId}`);
        
        setRoomMessages(prev => ({
          ...prev,
          [roomId]: roomMessagesData
        }));
        
        setMessages(roomMessagesData);
      }
    } catch (error) {
      console.error('❌ Failed to load room messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isLoadingMessages]);

  // Media Upload Funktion
  const uploadMedia = useCallback(async (file: File, type: 'image' | 'video'): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      const API_URL = getApiUrl();
      const formData = new FormData();
      formData.append('media', file);
      formData.append('type', type);

      console.log(`📤 Uploading ${type}:`, file.name, `(${file.size} bytes)`);

      const response = await fetch(`/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Media uploaded successfully:', data.url);
        return data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Media upload error:', error);
      return null;
    }
  }, []);

  // Socket Event Listeners erweitern
  useEffect(() => {
    if (!socketRef.current || !user) return;

    const handleNewMessage = (message: Message) => {
      console.log('📨 New message received:', message);
      
      const roomId = message.roomId || message.chatRoom || currentRoom;
      if (!roomId) return;

      // 🔥 KORRIGIERT: Normalisiere Message richtig
      const normalizedMessage = {
        ...message,
        username: message.username || message.sender?.username || 'Unbekannt',
        userId: message.userId || message.sender?._id || message.sender?.id,
        roomId: typeof roomId === 'string' ? roomId : String(roomId),
        user: message.user || {
          _id: message.sender?._id || message.sender?.id,
          id: message.sender?._id || message.sender?.id,
          username: message.sender?.username || 'Unbekannt'
        },
        sender: message.sender || {
          _id: message.userId || message.sender?._id,
          id: message.userId || message.sender?._id,
          username: message.username || 'Unbekannt'
        }
      };

      const finalRoomId = normalizedMessage.roomId;

      // 🔥 BEIDE Updates: roomMessages UND messages
      setRoomMessages(prev => ({
        ...prev,
        [finalRoomId]: [...(prev[finalRoomId] || []), normalizedMessage]
      }));

      // 🔥 CRITICAL: Wenn es der aktuelle Raum ist, auch messages updaten
      if (finalRoomId === currentRoom) {
        setMessages(prev => [...prev, normalizedMessage]);
      }
    };

    const handleJoinedRoom = (data: { roomId: string, messages: Message[] }) => {
      console.log('✅ Joined room successfully:', data.roomId);
      console.log(`📝 Received ${data.messages?.length || 0} messages`);
      
      if (data.messages) {
        setRoomMessages(prev => ({
          ...prev,
          [data.roomId]: data.messages
        }));
        
        // 🔥 CRITICAL: Setze messages direkt
        setMessages(data.messages);
      } else {
        // 🔥 Leere messages wenn kein Raum-Messages
        setMessages([]);
      }
    };

    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('joined-room', handleJoinedRoom);

    return () => {
      socketRef.current?.off('newMessage', handleNewMessage);
      socketRef.current?.off('joined-room', handleJoinedRoom);
    };
  }, [currentRoom, user]);

  // 🔥 KORRIGIERTE SOCKET CREATION - DEPENDENCY PROBLEM FIXED
  useEffect(() => {
    console.log('🔧 DEBUG: Socket creation useEffect triggered');
    console.log('   User available:', !!user);
    console.log('   User ID:', user?.id || user?._id);
    console.log('   User locationEnabled:', user?.locationEnabled);
    console.log('   Socket current:', !!socketRef.current);
    console.log('   Is connecting:', isConnectingRef.current);
    
    // 🔥 ERWEITERTE BEDINGUNGEN für Socket-Erstellung
    if (!user) {
      console.log('❌ No user - waiting for authentication');
      return;
    }
    
    if (!user.id && !user._id) {
      console.log('❌ No user ID - waiting for user data');
      return;
    }
    
    if (socketRef.current) {
      console.log('✅ Socket already exists');
      return;
    }
    
    if (isConnectingRef.current) {
      console.log('⏳ Already connecting');
      return;
    }

    console.log('🔗 CREATING SOCKET for:', user.username);
    isConnectingRef.current = true;

    const newSocket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      autoConnect: true
    });
    console.log('🌐 [DEBUG] Socket.IO-Client initialisiert:', SOCKET_URL);

    // EVENT LISTENERS
    newSocket.on('connect', () => {
      console.log('✅ [DEBUG] Socket connected:', newSocket.id);
      console.log('   Transport:', newSocket.io?.engine?.transport?.name);
      newSocket.emit('auth', {
        userId: user._id || user.id,
        username: user.username
      });
      console.log('🌐 [DEBUG] Auth-Daten gesendet:', { userId: user._id || user.id, username: user.username });
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('🔌 [DEBUG] Socket disconnected:', reason);
    });

    newSocket.on('auth-success', () => {
      console.log('✅ Auth successful');
    });

    // 🔥 KRITISCH: Verbesserte Message Event Handler mit bereinigter User-Extraktion
    newSocket.on('newMessage', (message: Message) => {
      console.log('📬 🔥 NEW MESSAGE received:', message.content);
      
      // 🔥 BEREINIGTER User-Daten Extraktion - Entferne redundante Felder
      const extractedUsername = message.username || 
                               message.sender?.username || 
                               message.user?.username ||
                               'Unbekannt';
      
      const extractedUserId = message.userId || 
                             message.sender?._id || 
                             message.sender?.id ||
                             message.user?._id || 
                             message.user?.id ||
                             'unknown';
      
      console.log('🔧 EXTRACTED User Data:');
      console.log('   Original message object keys:', Object.keys(message));
      console.log('   message.username:', message.username);
      console.log('   message.userId:', message.userId);
      console.log('   message.sender:', message.sender);
      console.log('   message.user:', message.user);
      console.log('   FINAL extracted username:', extractedUsername);
      console.log('   FINAL extracted userId:', extractedUserId);
      console.log('   Room:', message.chatRoom || message.roomId);
      
      // 🔥 NORMALISIERTE Message für State
      const normalizedMessage = {
        ...message,
        username: extractedUsername,
        userId: extractedUserId,
        // 🔥 Stelle sicher dass alle User-Felder gesetzt sind
        user: message.user || {
          _id: extractedUserId,
          id: extractedUserId,
          username: extractedUsername
        },
        sender: message.sender || {
          _id: extractedUserId,
          id: extractedUserId,
          username: extractedUsername
        }
      };
      
      if (mountedRef.current) {
        setMessages((prev: Message[]) => {
          console.log('🔧 Adding NORMALIZED message to state');
          console.log('   Previous count:', prev.length);
          console.log('   Normalized message user data:', {
            id: normalizedMessage._id || normalizedMessage.id,
            content: normalizedMessage.content,
            username: normalizedMessage.username,
            userId: normalizedMessage.userId
          });
          
          // 🔥 EINFACHE Duplicate-Prüfung
          const messageId = normalizedMessage._id || normalizedMessage.id;
          if (messageId) {
            const exists = prev.some(m => (m._id || m.id) === messageId);
            if (exists) {
              console.log('🔧 Duplicate message detected, skipping');
              return prev;
            }
          }
          
          // 🔥 CRITICAL: Normalisierte Message hinzufügen
          const newMessages = [...prev, normalizedMessage];
          console.log('   New total count:', newMessages.length);
          return newMessages;
        });
      }
    });

    // 🔥 KORRIGIERT: joined-room Handler - NEHME Server Messages
    newSocket.on('joined-room', (data: { roomId: string; messages: Message[]; userCount: number }) => {
      console.log('✅ 🔥 JOINED-ROOM event received:');
      console.log('   Room ID:', data.roomId);
      console.log('   Server messages count:', data.messages?.length || 0);
      console.log('   User count:', data.userCount);
      console.log('   Current client messages count:', messages.length);
      
      if (mountedRef.current) {
        // 🔥 CRITICAL: Setze currentRoom SOFORT
        console.log('🔥 Setting currentRoom to:', data.roomId);
        setCurrentRoom(data.roomId);
        
        // 🔥 CRITICAL: Nehme Server Messages als Wahrheit
        if (data.messages && data.messages.length > 0) {
          console.log('🔧 Server has messages - using as source of truth');
          console.log('🔧 Server messages preview:');
          data.messages.forEach((msg, i) => {
            console.log(`   ${i+1}. ${msg.username}: ${msg.content.substring(0, 30)}...`);
          });
          
          setMessages(data.messages);
        } else {
          console.log('🔧 Server has no messages - clearing client messages');
          setMessages([]);
        }
        
        console.log('🔧 🔥 FINAL STATE: currentRoom =', data.roomId, ', messages =', data.messages?.length || 0);
      }
    });

    // 🔥 NEUER EVENT LISTENER: Message-sent Bestätigung
    newSocket.on('message-sent', (data: { success: boolean; messageId: string; timestamp: string }) => {
      console.log('✅ 🔥 Message sent confirmation:', data);
    });

    // 🔥 NEUER EVENT LISTENER: Message-error
    newSocket.on('message-error', (error: { type: string; message: string; originalContent: string }) => {
      console.error('❌ 🔥 Message send error:', error);
    });

    // 🔥 NEUER: Debug alle Socket Events
    newSocket.onAny((eventName, ...args) => {
      console.log('🔥 SOCKET EVENT RECEIVED:', eventName);
      console.log('   Args:', args);
    });

    // 🔥 NEUER: Socket Error Events
    newSocket.on('connect_error', (error: any) => {
      console.error('❌ Socket connect error:', error);
    });

    newSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    newSocket.onAny((eventName, ...args) => {
      console.log('🌐 [DEBUG] SOCKET EVENT:', eventName, args);
    });

    socketRef.current = newSocket;
    isConnectingRef.current = false;

    return () => {
      if (socketRef.current) {
        console.log('🔌 Cleaning up socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [user?._id, user?.id, SOCKET_URL]); // 🔥 FIX: Nur bei user ID Änderung, nicht bei ganzen user object updates!

  useEffect(() => {
    console.log('🟢 [DEBUG] chatRooms State changed:', chatRooms);
  }, [chatRooms]);

  const detectLocation = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Detecting location...');
    
    if (!token) {
      console.log('❌ No token for location detection');
      return;
    }

    if (navigator.geolocation) {
      setIsLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('📍 Location detected:', { latitude, longitude, accuracy });
          
          setUserLocation({ latitude, longitude });
          setLocationAccuracy(accuracy);
          setIsLocationLoading(false);
          
          // Update location name
          await updateLocationName(latitude, longitude);
          
          // Fetch nearby rooms
          await fetchNearbyRoomsWithLocation(latitude, longitude);
        },
        (error) => {
          console.error('❌ Location error:', error);
          setIsLocationLoading(false);
          // Fallback to public rooms
          fetchAllPublicRooms();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.log('❌ Geolocation not supported');
      fetchAllPublicRooms();
    }
  }, [updateLocationName, fetchNearbyRoomsWithLocation, fetchAllPublicRooms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Context value
  const value: SocketContextType = {
    socket: socketRef.current,
    currentRoom,
    roomId: currentRoom,
    userLocation,
    currentLocationName,
    isLocationLoading,
    locationAccuracy,
    joinRoom,
    sendMessage,
    messages,
    rooms,
    chatRooms,
    roomMessages,
    isLoadingMessages,
    setRooms,
    setCurrentRoom,
    setMessages,
    user,
    createEventRoom,
    likeMessage,
    loadRoomMessages,
    uploadMedia,
    isRoomsLoading
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};