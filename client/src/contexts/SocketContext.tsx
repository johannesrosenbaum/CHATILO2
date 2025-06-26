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
  // 🔥 HINZUGEFÜGT: chatRoom Property für Server-Kompatibilität
  chatRoom?: string;  // <- NEU: Für Server Messages
  user?: {
    _id?: string;
    id?: string;
    username: string;
  };
  sender?: {
    _id?: string;
    id?: string;
    username: string;
  };
  type?: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export interface ChatRoom {
  _id?: string;
  id?: string;
  name: string;
  type?: 'location' | 'event' | 'global';
  subType?: 'regional' | 'city' | 'neighborhood' | 'general';
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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  console.log('🔧 STABLE: SocketProvider render');
  
  const { user } = useAuth();
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();

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

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:1113';

  // KORRIGIERTE ROOM NORMALIZATION - KEINE DOPPELTE _main ANHÄNGUNG
  // const normalizeRoomId = useCallback((roomName: string): string => { ... }, []);

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

  const fetchNearbyRoomsWithLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!mountedRef.current) return;
    
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
      
      const validateResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1113'}/api/auth/me`, {
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
        const freshValidateResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1113'}/api/auth/me`, {
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
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1113'}/api/chat/rooms/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude, radius: 10000 })
      });

      console.log(`🔧 DEBUG: Rooms API Response status: ${response.status}`);
      console.log(`   Response ok: ${response.ok}`);
      
      if (response.ok && mountedRef.current) {
        const nearbyRooms = await response.json();
        console.log(`🏠 FOUND ${nearbyRooms.length} nearby rooms:`);
        nearbyRooms.forEach((room, i) => {
          console.log(`   ${i+1}. ${room.name} (${room.type || 'unknown'}, ${room.participants || 0} users)`);
        });
        
        setChatRooms(nearbyRooms);
        console.log(`✅ ChatRooms updated with ${nearbyRooms.length} rooms`);
      } else {
        console.error(`❌ Nearby rooms API STILL failed after token validation:`);
        console.error(`   Status: ${response.status}`);
        console.error(`   Status Text: ${response.statusText}`);
        
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

  // STABLE SEND MESSAGE - PREVENT ROOM REJOIN
  const sendMessage = useCallback((content: string) => {
    console.log('📤 Sending:', content);

    if (!socketRef.current || !currentRoom) {
      console.error('❌ Cannot send message - no socket or room');
      return;
    }

    // 🔥 KORRIGIERT: Prevent unnecessary room changes during message send
    console.log('🔧 SEND MESSAGE STATUS:');
    console.log('   Current room:', currentRoom);
    console.log('   Socket connected:', socketRef.current.connected);
    console.log('   Messages count before send:', messages.length);

    const messageData = {
      content: content.trim(),
      chatRoom: currentRoom,
      timestamp: new Date().toISOString()
    };

    console.log('📤 EMITTING sendMessage with data:', messageData);
    socketRef.current.emit('sendMessage', messageData);
  }, [currentRoom, messages.length]);

  // STABLE DUMMY FUNCTIONS
  const createEventRoom = useCallback(async (eventData: any): Promise<ChatRoom | null> => {
    console.log('🎉 Creating event room:', eventData);
    return null;
  }, []);

  const likeMessage = useCallback(async (messageId: string): Promise<void> => {
    console.log('👍 Liking message:', messageId);
  }, []);

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

    // EVENT LISTENERS
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      console.log('   Socket ID:', newSocket.id);
      console.log('   Transport:', newSocket.io?.engine?.transport?.name);
      
      newSocket.emit('auth', {
        userId: user._id || user.id,
        username: user.username
      });
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
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
  }, [user, SOCKET_URL]); // 🔥 KORRIGIERT: user statt spezifische Properties

  const detectLocation = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(`🔧 DEBUG: detectLocation called`);
    console.log(`   Token available: ${!!token}`);
    console.log(`   Token preview: ${token ? token.substring(0, 20) + '...' : 'none'}`);
    console.log(`   Component mounted: ${mountedRef.current}`);
    
    if (!token || !mountedRef.current) {
      console.log(`❌ Missing requirements - token: ${!!token}, mounted: ${mountedRef.current}`);
      return;
    }
    
    setIsLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) {
          console.log('🔧 Component unmounted during location detection, skipping');
          return;
        }
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Location detected: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
        
        setUserLocation({ latitude, longitude });
        setLocationAccuracy(accuracy);
        setIsLocationLoading(false);
        
        // BEIDE Funktionen aufrufen
        updateLocationName(latitude, longitude);
        
        // 🔥 SOFORTIGER Nearby Rooms Call
        console.log(`🌍 IMMEDIATE: Calling fetchNearbyRoomsWithLocation`);
        fetchNearbyRoomsWithLocation(latitude, longitude);
      },
      (error) => {
        console.error('❌ DETAILED Geolocation error:');
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        console.error('   Error details:', error);
        
        if (mountedRef.current) {
          setIsLocationLoading(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [updateLocationName, fetchNearbyRoomsWithLocation]); // 🔥 STABLE dependencies

  // 🔥 KORRIGIERTE LOCATION DETECTION - TRIGGER NACH USER LOAD
  useEffect(() => {
    console.log('🔧 DEBUG: Location detection useEffect triggered');
    console.log('   User available:', !!user);
    console.log('   User locationEnabled:', user?.locationEnabled);
    console.log('   UserLocation exists:', !!userLocation);
    console.log('   Is location loading:', isLocationLoading);
    console.log('   Socket exists:', !!socketRef.current);
    console.log('   Component mounted:', mountedRef.current);
    
    // 🔥 ERWEITERTE BEDINGUNGEN für Location Detection
    if (!user || !mountedRef.current) {
      console.log('❌ No user or component unmounted for location detection');
      return;
    }
    
    if (!user.locationEnabled) {
      console.log('❌ User location disabled');
      return;
    }
    
    if (userLocation) {
      console.log('✅ Location already detected');
      return;
    }
    
    if (isLocationLoading) {
      console.log('⏳ Location detection already in progress');
      return;
    }
    
    console.log('📍 Starting location detection');
    console.log(`   User: ${user?.username}`);
    console.log(`   User ID: ${user?._id || user?.id}`);
    
    // 🔥 SOFORTIGER START - kein Delay
    console.log('🚀 STARTING location detection immediately');
    detectLocation();
    
  }, [user, userLocation, isLocationLoading, detectLocation]);

  // AUTO-JOIN FROM URL - STABLE
  useEffect(() => {
    if (urlRoomId && socketRef.current && urlRoomId !== currentRoom) {
      console.log(`🚪 Auto-joining from URL: ${urlRoomId}`);
      joinRoom(urlRoomId); // 🔥 Direkte Verwendung ohne Normalisierung
    }
  }, [urlRoomId, currentRoom, joinRoom]);

  // CLEANUP ON UNMOUNT - 🔥 KORRIGIERT: mountedRef auf false setzen NACH cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      console.log('🔌 Component unmount cleanup starting');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // 🔥 WICHTIG: mountedRef NACH cleanup auf false setzen
      mountedRef.current = false;
      console.log('🔌 Component unmount cleanup completed');
    };
  }, []);

  // STABLE CONTEXT VALUE - SOCKET AUS REF
  const value = useMemo<SocketContextType>(() => ({
    socket: socketRef.current,
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
    setCurrentRoom,
    setMessages,
    user,
    createEventRoom,
    likeMessage
  }), [
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
    user,
    createEventRoom,
    likeMessage
  ]); // SOCKET NICHT IN DEPS!

  console.log('🔧 STABLE: SocketProvider value ready');

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};