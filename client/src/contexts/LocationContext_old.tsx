import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LocationState, Location, ChatRoom } from '../types';
import { useAuth } from './AuthContext';

interface LocationContextType extends LocationState {
  getCurrentLocation: () => Promise<Location | null>;
  updateLocation: (location: Location) => Promise<void>;
  loadUserChatRooms: () => Promise<void>;
  createLocalChatRooms: (location: Location) => Promise<void>;
  setChatRoomsCallback: (callback: (rooms: ChatRoom[]) => void) => void;
  initializeUserLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

type LocationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_LOCATION'; payload: Location | null }
  | { type: 'SET_NEARBY_CHAT_ROOMS'; payload: ChatRoom[] };

const initialState: LocationState = {
  currentLocation: null,
  nearbyChatRooms: [],
  isLoading: false,
  error: null,
};

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'SET_NEARBY_CHAT_ROOMS':
      return { ...state, nearbyChatRooms: action.payload };
    default:
      return state;
  }
};

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { setLocationCallback, isAuthenticated } = useAuth();
  const chatRoomsCallbackRef = useRef<((rooms: ChatRoom[]) => void) | null>(null);
  const hasInitialized = useRef(false);

  // Initialize user locations and chat rooms only once when user logs in
  useEffect(() => {
    if (isAuthenticated && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeUserLocations();
    } else if (!isAuthenticated) {
      hasInitialized.current = false;
    }
  }, [isAuthenticated]);

  // Register location callback with AuthContext
  useEffect(() => {
    if (setLocationCallback) {
      setLocationCallback(initializeUserLocations);
    }
  }, [setLocationCallback]);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const address = data.address;

      return {
        street: address.road || address.street,
        city: address.city || address.town || address.village || address.county,
        state: address.state,
        country: address.country,
        postalCode: address.postcode,
      };
    } catch (error) {
      console.error('Error getting address:', error);
      return {
        city: 'Unbekannt',
        country: 'Unbekannt',
      };
    }
  };

  const initializeUserLocations = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    console.log('🌍 Initialisiere Benutzer-Standorte...');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation) {
        await updateLocation(currentLocation);
        await createLocalChatRooms(currentLocation);
        await loadUserChatRooms();
      }
    } catch (error) {
      console.error('❌ Fehler bei Standort-Initialisierung:', error);
      toast.error('Standort konnte nicht initialisiert werden');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const error = 'Geolocation wird von diesem Browser nicht unterstützt';
        dispatch({ type: 'SET_ERROR', payload: error });
        reject(new Error(error));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            
            if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
              const errorMessage = 'Ungültige Standortdaten erhalten';
              dispatch({ type: 'SET_ERROR', payload: errorMessage });
              reject(new Error(errorMessage));
              return;
            }

            const address = await getAddressFromCoordinates(latitude, longitude);
            
            const location: Location = {
              latitude,
              longitude,
              accuracy,
              address,
              timestamp: new Date(),
            };

            console.log('📍 Standort erfolgreich abgerufen:', location);
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
            
            resolve(location);
          } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Abrufen der Standortdaten' });
            reject(error);
          }
        },
        (error) => {
          let errorMessage = 'Standort konnte nicht abgerufen werden';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Standortzugriff wurde verweigert';
              setLocationPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Standortinformationen sind nicht verfügbar';
              break;
            case error.TIMEOUT:
              errorMessage = 'Standortabfrage hat das Zeitlimit überschritten';
              break;
          }

          dispatch({ type: 'SET_ERROR', payload: errorMessage });
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const updateLocation = async (location: Location) => {
    try {
      await axios.put('/api/location', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    } catch (error: any) {
      console.error('Error updating location on server:', error);
    }
  };

  const loadUserChatRooms = async () => {
    console.log('🔍 Lade alle Benutzer-Chaträume...');
    
    try {
      const response = await axios.get('/api/chat/rooms/user');
      
      if (response.data.success && response.data.rooms) {
        const chatRooms = response.data.rooms;
        console.log('✅ Benutzer-Chaträume geladen:', chatRooms.length, 'Räume');
        
        dispatch({ type: 'SET_NEARBY_CHAT_ROOMS', payload: chatRooms });
        
        if (chatRoomsCallbackRef.current) {
          console.log('🔄 Sende Räume an ChatContext...');
          chatRoomsCallbackRef.current(chatRooms);
        }
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Benutzer-Chaträume:', error);
      dispatch({ type: 'SET_NEARBY_CHAT_ROOMS', payload: [] });
    }
  };

  const createLocalChatRooms = async (location: Location) => {
    try {
      const response = await axios.post('/api/chat/rooms/initialize-local', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });

      if (response.data.success) {
        console.log('✅ Lokale Chaträume erstellt/gefunden');
        toast.success('Lokale Chaträume wurden initialisiert!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Erstellen der lokalen Chaträume';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('❌ Fehler beim Erstellen lokaler Chaträume:', error);
    }
  };

  const setChatRoomsCallback = (callback: (rooms: ChatRoom[]) => void) => {
    console.log('🔧 LocationContext: ChatRoomsCallback registriert');
    chatRoomsCallbackRef.current = callback;
  };

  const value: LocationContextType = {
    ...state,
    getCurrentLocation,
    updateLocation,
    loadUserChatRooms,
    createLocalChatRooms,
    setChatRoomsCallback,
    initializeUserLocations,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
