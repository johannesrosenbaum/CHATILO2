import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChatState, ChatRoom, Message, SocketEvents } from '../types';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';

interface ChatContextType extends ChatState {
  joinChatRoom: (roomId: string) => Promise<void>;
  leaveChatRoom: (roomId: string) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'video' | 'audio', file?: File) => Promise<void>;
  likeMessage: (messageId: string) => Promise<void>;
  unlikeMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMessages: (roomId: string, page?: number) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  loadChatRooms: () => Promise<void>;
  setActiveChatRoom: (room: ChatRoom | null) => void;
  // ⭐ FAVORITEN-FUNKTIONEN
  toggleFavoriteRoom: (roomId: string) => void;
  getFavoriteRoomsData: () => ChatRoom[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_CHAT_ROOM'; payload: ChatRoom | null }
  | { type: 'SET_CHAT_ROOMS'; payload: ChatRoom[] }
  | { type: 'ADD_CHAT_ROOM'; payload: ChatRoom }
  | { type: 'UPDATE_CHAT_ROOM'; payload: ChatRoom }
  | { type: 'SET_MESSAGES'; payload: { roomId: string; messages: Message[] } }
  | { type: 'PREPEND_MESSAGES'; payload: { roomId: string; messages: Message[] } } // 📄 Für Pagination
  | { type: 'ADD_MESSAGE'; payload: { roomId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { roomId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'REMOVE_MESSAGE'; payload: { roomId: string; messageId: string } }
  | { type: 'SET_TYPING_USERS'; payload: { roomId: string; userIds: string[] } }
  | { type: 'ADD_TYPING_USER'; payload: { roomId: string; userId: string } }
  | { type: 'REMOVE_TYPING_USER'; payload: { roomId: string; userId: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_FAVORITE_ROOMS'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE_ROOM'; payload: string }
  | { type: 'SET_PAGINATION'; payload: { roomId: string; pagination: { currentPage: number; hasMore: boolean; isLoading: boolean; totalMessages: number } } }; // 📄 Pagination

// 💾 LOKALE SPEICHERUNG FÜR PERSISTENZ
const saveMessagesToStorage = (messages: { [roomId: string]: any[] }) => {
  try {
    localStorage.setItem('chatilo_messages', JSON.stringify(messages));
  } catch (error) {
    console.warn('🔧 [Storage] Fehler beim Speichern der Messages:', error);
  }
};

const loadMessagesFromStorage = (): { [roomId: string]: any[] } => {
  try {
    const stored = localStorage.getItem('chatilo_messages');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🔧 [Storage] Messages aus localStorage geladen:', Object.keys(parsed).length, 'Räume');
      return parsed;
    }
  } catch (error) {
    console.warn('🔧 [Storage] Fehler beim Laden der Messages:', error);
  }
  return {};
};

// ⭐ FAVORITEN SPEICHERN/LADEN
const saveFavoritesToStorage = (favoriteRooms: string[]) => {
  try {
    localStorage.setItem('chatilo_favorites', JSON.stringify(favoriteRooms));
    console.log('⭐ [Storage] Favoriten gespeichert:', favoriteRooms.length);
  } catch (error) {
    console.warn('⭐ [Storage] Fehler beim Speichern der Favoriten:', error);
  }
};

const loadFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem('chatilo_favorites');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('⭐ [Storage] Favoriten geladen:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.warn('⭐ [Storage] Fehler beim Laden der Favoriten:', error);
  }
  return [];
};

const initialState: ChatState = {
  chatRooms: [],
  activeChatRoom: null,
  messages: loadMessagesFromStorage(), // 🔥 LADE MESSAGES AUS LOCALSTORAGE
  isLoading: false,
  error: null,
  typingUsers: {},
  favoriteRooms: loadFavoritesFromStorage(), // ⭐ LADE FAVORITEN AUS LOCALSTORAGE
  messagesPagination: {}, // 📄 PAGINATION STATE
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_ACTIVE_CHAT_ROOM':
      return { ...state, activeChatRoom: action.payload };
    case 'SET_CHAT_ROOMS':
      return { ...state, chatRooms: action.payload };
    case 'ADD_CHAT_ROOM':
      if (!action.payload || !action.payload._id) return state;
      return {
        ...state,
        chatRooms: [...state.chatRooms.filter(room => room && room._id !== action.payload._id), action.payload],
      };
    case 'UPDATE_CHAT_ROOM':
      if (!action.payload || !action.payload._id) return state;
      return {
        ...state,
        chatRooms: state.chatRooms.map(room =>
          room && room._id === action.payload._id ? action.payload : room
        ),
      };
    case 'SET_MESSAGES':
      const setMessagesState = {
        ...state.messages,
        [action.payload.roomId]: action.payload.messages,
      };
      // 💾 SPEICHERE MESSAGES IN LOCALSTORAGE
      saveMessagesToStorage(setMessagesState);
      return {
        ...state,
        messages: setMessagesState,
      };
    case 'PREPEND_MESSAGES': // 📄 Für Pagination - ältere Nachrichten vorne hinzufügen
      const prependMessagesState = {
        ...state.messages,
        [action.payload.roomId]: [
          ...action.payload.messages,
          ...(state.messages[action.payload.roomId] || []),
        ],
      };
      saveMessagesToStorage(prependMessagesState);
      return {
        ...state,
        messages: prependMessagesState,
      };
    case 'ADD_MESSAGE':
      const newMessagesState = {
        ...state.messages,
        [action.payload.roomId]: [
          ...(state.messages[action.payload.roomId] || []),
          action.payload.message,
        ],
      };
      // 💾 SPEICHERE MESSAGES IN LOCALSTORAGE
      saveMessagesToStorage(newMessagesState);
      return {
        ...state,
        messages: newMessagesState,
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: (state.messages[action.payload.roomId] || []).map(message =>
            message._id === action.payload.messageId
              ? { ...message, ...action.payload.updates }
              : message
          ),
        },
      };
    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: (state.messages[action.payload.roomId] || []).filter(
            message => message._id !== action.payload.messageId
          ),
        },
      };
    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.roomId]: action.payload.userIds,
        },
      };
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.roomId]: [
            ...(state.typingUsers[action.payload.roomId] || []).filter(id => id !== action.payload.userId),
            action.payload.userId,
          ],
        },
      };
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.roomId]: (state.typingUsers[action.payload.roomId] || []).filter(
            id => id !== action.payload.userId
          ),
        },
      };
    case 'SET_FAVORITE_ROOMS':
      saveFavoritesToStorage(action.payload);
      return {
        ...state,
        favoriteRooms: action.payload,
      };
    case 'TOGGLE_FAVORITE_ROOM':
      const newFavorites = state.favoriteRooms.includes(action.payload)
        ? state.favoriteRooms.filter(id => id !== action.payload)
        : [...state.favoriteRooms, action.payload];
      saveFavoritesToStorage(newFavorites);
      return {
        ...state,
        favoriteRooms: newFavorites,
      };
    case 'SET_PAGINATION': // 📄 Pagination State setzen
      return {
        ...state,
        messagesPagination: {
          ...state.messagesPagination,
          [action.payload.roomId]: action.payload.pagination,
        },
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket } = useSocket();
  const { user } = useAuth();
  const { setChatRoomsCallback } = useLocation();

  // Beim Initialisieren des ChatContext
  useEffect(() => {
    if (!user || (!user._id && !user.id)) {
      console.log('🔧 [ChatContext] User noch nicht geladen, warte...');
      return;
    }
    console.log('🔧 [ChatContext] User im Context:', user);
    
    // 🔥 KORRIGIERT: Registriere Callback für NearbyChatRooms erst nach User-Loading
    if (setChatRoomsCallback) {
      const handleNearbyChatRooms = (rooms: ChatRoom[]) => {
        console.log('🎯 ChatContext: NearbyChatRooms empfangen:', rooms);
        if (rooms && Array.isArray(rooms)) {
          console.log(`✅ ChatContext: ${rooms.length} Räume im State gespeichert`);
          dispatch({ type: 'SET_CHAT_ROOMS', payload: rooms });
        } else {
          console.log('⚠️ ChatContext: Ungültige Räume empfangen:', rooms);
        }
      };
      console.log('🔧 ChatContext: Registriere ChatRoomsCallback...');
      setChatRoomsCallback(handleNearbyChatRooms);
    }
  }, [user, setChatRoomsCallback]);

  const joinChatRoom = async (roomId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null }); // Clear previous errors
      console.log('🔧 [joinChatRoom] Starte Join für Raum:', roomId);
      
      // Prüfe ob der Raum bereits im State ist
      const existingRoom = state.chatRooms.find(room => room._id === roomId);
      
      if (existingRoom && state.activeChatRoom?._id === roomId) {
        console.log('🔧 [joinChatRoom] Raum bereits aktiv, überspringe API-Call');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      if (existingRoom) {
        console.log('🔧 [joinChatRoom] Raum im State gefunden, setze nur als aktiv');
        dispatch({ type: 'SET_ACTIVE_CHAT_ROOM', payload: existingRoom });
        if (socket) {
          socket.emit('join-room', roomId);
        }
        // Messages nur laden wenn noch nicht vorhanden
        if (!state.messages[roomId] || state.messages[roomId].length === 0) {
          await loadMessages(roomId);
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Neuer Raum - API-Call notwendig
      console.log('🔧 [joinChatRoom] Neuer Raum, führe API-Call durch');
      const response = await axios.post(`/api/chat/rooms/${roomId}/join`);
      console.log('🔧 [joinChatRoom] API-Response:', response.data);
      
      if (!response.data.success || !response.data.room) {
        throw new Error('Ungültige Server-Antwort');
      }
      
      const chatRoom = response.data.room;
      console.log('🔧 [joinChatRoom] chatRoom aus Response:', chatRoom);
      dispatch({ type: 'ADD_CHAT_ROOM', payload: chatRoom });
      dispatch({ type: 'SET_ACTIVE_CHAT_ROOM', payload: chatRoom });
      console.log('🔧 [joinChatRoom] State nach Dispatch:', {
        activeChatRoom: chatRoom,
        chatRooms: state.chatRooms
      });
      if (socket) {
        socket.emit('join-room', roomId);
      }
      // Load messages for this room nur wenn noch nicht vorhanden
      if (!state.messages[roomId] || state.messages[roomId].length === 0) {
        await loadMessages(roomId);
      }
    } catch (error: any) {
      console.error('❌ [joinChatRoom] Fehler:', error);
      const message = error.response?.data?.message || error.message || 'Fehler beim Beitreten des Chatraums';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveChatRoom = (roomId: string) => {
    console.log('🔧 [leaveChatRoom] Verlasse Raum:', roomId);
    console.log('   Messages behalten:', state.messages[roomId]?.length || 0);
    
    if (socket) {
      socket.emit('leave-room', roomId);
    }
    
    // NUR den aktiven ChatRoom auf null setzen, aber Messages und ChatRooms behalten!
    if (state.activeChatRoom?._id === roomId) {
      dispatch({ type: 'SET_ACTIVE_CHAT_ROOM', payload: null });
    }
    
    console.log('🔧 [leaveChatRoom] Raum verlassen, Messages bleiben erhalten');
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'video' | 'audio' = 'text', file?: File) => {
    if (!state.activeChatRoom) {
      toast.error('Kein aktiver Chatraum');
      return;
    }

    try {
      let response;
      if (file) {
        // Media-Upload
        const formData = new FormData();
        formData.append('media', file);
        formData.append('type', type);
        formData.append('content', content);
        formData.append('roomId', state.activeChatRoom._id);
        response = await axios.post('/api/chat/upload/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Textnachricht
        response = await axios.post(
          `/api/chat/rooms/${state.activeChatRoom._id}/messages`,
          { content, type },
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const message = response.data.message;
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { roomId: state.activeChatRoom._id, message },
      });

      // 💾 SPEICHERE NACHRICHTEN IM LOCALSTORAGE
      saveMessagesToStorage({
        ...state.messages,
        [state.activeChatRoom._id]: [...(state.messages[state.activeChatRoom._id] || []), message],
      });

      if (socket) {
        socket.emit('sendMessage', {
          content,
          chatRoom: state.activeChatRoom._id,
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Senden der Nachricht';
      toast.error(message);
    }
  };

  const likeMessage = async (messageId: string) => {
    try {
      await axios.post(`/api/chat/messages/${messageId}/like`);
      
      if (socket) {
        socket.emit('message:like', messageId);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Liken der Nachricht';
      toast.error(message);
    }
  };

  const unlikeMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/chat/messages/${messageId}/like`);
      
      if (socket) {
        socket.emit('message:unlike', messageId);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Unliken der Nachricht';
      toast.error(message);
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      await axios.put(`/api/chat/messages/${messageId}`, { content });
      
      if (socket) {
        socket.emit('message:edit', { messageId, content });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Bearbeiten der Nachricht';
      toast.error(message);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/chat/messages/${messageId}`);
      
      if (socket) {
        socket.emit('message:delete', messageId);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Löschen der Nachricht';
      toast.error(message);
    }
  };

  const loadMessages = async (roomId: string, page: number = 1) => {
    try {
      // Setze Loading State für Pagination
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          roomId,
          pagination: {
            currentPage: page,
            hasMore: false,
            isLoading: true,
            totalMessages: 0,
          },
        },
      });

      const response = await axios.get(`/api/chat/rooms/${roomId}/messages?page=${page}&limit=20`);
      const { messages, pagination } = response.data;
      
      if (page === 1) {
        // Erste Seite: Setze alle Nachrichten
        dispatch({
          type: 'SET_MESSAGES',
          payload: { roomId, messages },
        });
      } else {
        // Weitere Seiten: Füge ältere Nachrichten vorne hinzu
        dispatch({
          type: 'PREPEND_MESSAGES',
          payload: { roomId, messages },
        });
      }

      // Aktualisiere Pagination State
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          roomId,
          pagination: {
            currentPage: pagination.currentPage,
            hasMore: pagination.hasNextPage,
            isLoading: false,
            totalMessages: pagination.totalMessages,
          },
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Laden der Nachrichten';
      toast.error(message);
      
      // Reset Loading State bei Fehler
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          roomId,
          pagination: {
            currentPage: page,
            hasMore: false,
            isLoading: false,
            totalMessages: 0,
          },
        },
      });
    }
  };

  const loadMoreMessages = async (roomId: string) => {
    const currentPagination = state.messagesPagination[roomId];
    if (!currentPagination || currentPagination.isLoading || !currentPagination.hasMore) {
      return;
    }
    
    await loadMessages(roomId, currentPagination.currentPage + 1);
  };

  const loadChatRooms = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get('/api/chat/rooms');
      const chatRooms = response.data.data;
      
      dispatch({ type: 'SET_CHAT_ROOMS', payload: chatRooms });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Laden der Chaträume';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveChatRoom = (room: ChatRoom | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT_ROOM', payload: room });
  };

  // ⭐ FAVORITEN-FUNKTIONEN
  const toggleFavoriteRoom = (roomId: string) => {
    console.log('⭐ [ChatContext] Toggle Favorite für Raum:', roomId);
    dispatch({ type: 'TOGGLE_FAVORITE_ROOM', payload: roomId });
  };

  const getFavoriteRoomsData = (): ChatRoom[] => {
    return state.chatRooms.filter(room => 
      room && room._id && state.favoriteRooms.includes(room._id)
    );
  };

  const value: ChatContextType = {
    ...state,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    likeMessage,
    unlikeMessage,
    editMessage,
    deleteMessage,
    loadMessages,
    loadMoreMessages,
    loadChatRooms,
    setActiveChatRoom,
    toggleFavoriteRoom,
    getFavoriteRoomsData,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};