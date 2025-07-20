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
  loadChatRooms: () => Promise<void>;
  setActiveChatRoom: (room: ChatRoom | null) => void;
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
  | { type: 'ADD_MESSAGE'; payload: { roomId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { roomId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'REMOVE_MESSAGE'; payload: { roomId: string; messageId: string } }
  | { type: 'SET_TYPING_USERS'; payload: { roomId: string; userIds: string[] } }
  | { type: 'ADD_TYPING_USER'; payload: { roomId: string; userId: string } }
  | { type: 'REMOVE_TYPING_USER'; payload: { roomId: string; userId: string } };

const initialState: ChatState = {
  activeChatRoom: null,
  chatRooms: [],
  messages: {},
  isLoading: false,
  error: null,
  typingUsers: {},
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: action.payload.messages,
        },
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.roomId]: [
            ...(state.messages[action.payload.roomId] || []),
            action.payload.message,
          ],
        },
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
    default:
      return state;
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    
    // 🔥 NEU: Registriere Callback für NearbyChatRooms
    if (setChatRoomsCallback) {
      const handleNearbyChatRooms = (rooms: ChatRoom[]) => {
        console.log('🎯 ChatContext: NearbyChatRooms empfangen:', rooms);
        dispatch({ type: 'SET_CHAT_ROOMS', payload: rooms });
      };
      setChatRoomsCallback(handleNearbyChatRooms);
    }
  }, [user, setChatRoomsCallback]);

  const joinChatRoom = async (roomId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('🔧 [joinChatRoom] Starte Join für Raum:', roomId);
      const response = await axios.post(`/api/chat/rooms/${roomId}/join`);
      console.log('🔧 [joinChatRoom] API-Response:', response.data);
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
      // Load messages for this room
      await loadMessages(roomId);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Beitreten des Chatraums';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveChatRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
    
    if (state.activeChatRoom?._id === roomId) {
      dispatch({ type: 'SET_ACTIVE_CHAT_ROOM', payload: null });
    }
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
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages?page=${page}&limit=50`);
      const messages = response.data.messages; // <-- KORREKTES Feld!
      
      if (page === 1) {
        dispatch({
          type: 'SET_MESSAGES',
          payload: { roomId, messages },
        });
      } else {
        dispatch({
          type: 'SET_MESSAGES',
          payload: { roomId, messages: [...messages, ...(state.messages[roomId] || [])] },
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Laden der Nachrichten';
      toast.error(message);
    }
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
    loadChatRooms,
    setActiveChatRoom,
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