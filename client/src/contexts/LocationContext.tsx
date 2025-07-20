import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LocationState, Location, ChatRoom } from '../types';
import { useAuth } from './AuthContext';

interface LocationContextType extends LocationState {
  getCurrentLocation: () => Promise<Location | null>;
  updateLocation: (location: Location) => Promise<void>;
  loadNearbyChatRooms: () => Promise<void>;
  createLocalChatRooms: (location: Location) => Promise<void>;
  setChatRoomsCallback: (callback: (rooms: ChatRoom[]) => void) => void;
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

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { setLocationCallback } = useAuth();
  // 🔥 KORRIGIERT: Verwende useRef für persistenten Callback
  const chatRoomsCallbackRef = useRef<((rooms: ChatRoom[]) => void) | null>(null);

  // Register location callback with AuthContext
  useEffect(() => {
    if (setLocationCallback) {
      const locationWrapper = async () => {
        console.log('📍 AuthContext: Automatische Standortabfrage gestartet...');
        try {
          await getCurrentLocation();
          console.log('✅ AuthContext: Automatische Standortabfrage erfolgreich');
        } catch (error) {
          console.log('❌ AuthContext: Automatische Standortabfrage fehlgeschlagen:', error);
        }
      };
      console.log('🔧 LocationContext: Registriere LocationCallback für AuthContext...');
      setLocationCallback(locationWrapper);
    } else {
      console.log('⚠️ LocationContext: setLocationCallback nicht verfügbar');
    }
  }, [setLocationCallback]);

  // 🔥 KORRIGIERT: Wrapper-Funktion für loadNearbyChatRooms ohne Parameter
  const loadNearbyChatRoomsWrapper = async () => {
    if (state.currentLocation) {
      await loadNearbyChatRooms(state.currentLocation);
    } else {
      console.log('⚠️ Kein Standort verfügbar für NearbyChatRooms');
    }
  };

  // 🔥 KORRIGIERT: Debug-Callback-Registrierung mit useRef
  const debugSetChatRoomsCallback = (callback: (rooms: ChatRoom[]) => void) => {
    console.log('🔧 LocationContext: ChatRoomsCallback registriert');
    chatRoomsCallbackRef.current = callback;
  };

  // Check location permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      });
    }
  }, []);

  // 🔥 NEU: Lade NearbyChatRooms wenn User verfügbar ist
  useEffect(() => {
    if (state.currentLocation && chatRoomsCallbackRef.current) {
      console.log('🔄 Automatisches Laden der NearbyChatRooms nach User-Login...');
      loadNearbyChatRooms(state.currentLocation);
    }
  }, [state.currentLocation, chatRoomsCallbackRef.current]);

  const getCurrentLocation = async (): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const error = 'Geolocation wird von diesem Browser nicht unterstützt';
        dispatch({ type: 'SET_ERROR', payload: error });
        reject(new Error(error));
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Get address from coordinates using reverse geocoding
            const address = await getAddressFromCoordinates(latitude, longitude);
            
            // 🔥 NEU: Validiere Standort vor dem Speichern
            if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
              console.log('❌ Ungültige Koordinaten erhalten:', { latitude, longitude });
              const errorMessage = 'Ungültige Standortdaten erhalten';
              dispatch({ type: 'SET_ERROR', payload: errorMessage });
              dispatch({ type: 'SET_LOADING', payload: false });
              reject(new Error(errorMessage));
              return;
            }

            const location: Location = {
              latitude,
              longitude,
              accuracy,
              address,
              timestamp: new Date(),
            };

            console.log('📍 Standort erfolgreich abgerufen:', location);
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
            dispatch({ type: 'SET_LOADING', payload: false });

            // Update user location on server
            await updateLocation(location);
            
            // 🔥 KORRIGIERT: Warte kurz, damit der State aktualisiert wird
            setTimeout(async () => {
              console.log('🔄 Lade NearbyChatRooms nach Standortaktualisierung...');
              await loadNearbyChatRooms(location);
            }, 500);
            
            resolve(location);
          } catch (error) {
            const errorMessage = 'Fehler beim Abrufen der Standortdaten';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            dispatch({ type: 'SET_LOADING', payload: false });
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
            default:
              errorMessage = 'Unbekannter Fehler beim Abrufen des Standorts';
              break;
          }

          dispatch({ type: 'SET_ERROR', payload: errorMessage });
          dispatch({ type: 'SET_LOADING', payload: false });
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
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

  const updateLocation = async (location: Location) => {
    try {
      await axios.put('/api/location', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    } catch (error: any) {
      console.error('Error updating location on server:', error);
      // Don't show error to user for location updates
    }
  };

  // 🔥 KORRIGIERT: Verbesserte Standortvalidierung
  const loadNearbyChatRooms = async (location: Location) => {
    console.log('🔍 loadNearbyChatRooms aufgerufen');
    console.log('📍 Aktueller Standort im State:', location);
    
    // 🔥 NEU: Validiere Standort vor API-Aufruf
    if (!location || 
        typeof location.latitude !== 'number' || 
        typeof location.longitude !== 'number' ||
        isNaN(location.latitude) || 
        isNaN(location.longitude) ||
        location.latitude === 0 || 
        location.longitude === 0) {
      console.log('❌ Ungültiger Standort für NearbyChatRooms:', location);
      console.log('   Latitude:', location?.latitude, 'Type:', typeof location?.latitude);
      console.log('   Longitude:', location?.longitude, 'Type:', typeof location?.longitude);
      return;
    }

    console.log('🔍 Lade NearbyChatRooms für Standort:', location);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/chat/rooms/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 50000
        }
      });

      console.log('📡 NearbyChatRooms API Response:', response.data);
      
      if (response.data.success && response.data.rooms) {
        const chatRooms = response.data.rooms;
        console.log('✅ NearbyChatRooms geladen:', chatRooms.length, 'Räume');
        console.log('📋 Räume:', chatRooms);
        
        dispatch({ type: 'SET_NEARBY_CHAT_ROOMS', payload: chatRooms });
        
        // 🔥 KORRIGIERT: Sende Räume an ChatContext mit useRef
        console.log('🔍 chatRoomsCallback Status:', chatRoomsCallbackRef.current ? 'verfügbar' : 'NULL');
        if (chatRoomsCallbackRef.current) {
          console.log('🔄 Sende Räume an ChatContext...');
          chatRoomsCallbackRef.current(chatRooms);
        } else {
          console.log('❌ chatRoomsCallback ist NULL - ChatContext hat noch keinen Callback registriert');
          // 🔥 NEU: Versuche es später nochmal
          setTimeout(() => {
            if (chatRoomsCallbackRef.current) {
              console.log('🔄 Späterer Versuch: Sende Räume an ChatContext...');
              chatRoomsCallbackRef.current(chatRooms);
            } else {
              console.log('❌ chatRoomsCallback immer noch NULL nach Timeout');
            }
          }, 1000);
        }
      } else {
        console.log('⚠️ Keine Räume in der API-Antwort gefunden');
        dispatch({ type: 'SET_NEARBY_CHAT_ROOMS', payload: [] });
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der NearbyChatRooms:', error);
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

      const chatRooms = response.data.data;
      dispatch({ type: 'SET_NEARBY_CHAT_ROOMS', payload: chatRooms });
      
      toast.success('Lokale Chaträume wurden erstellt!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Fehler beim Erstellen der lokalen Chaträume';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  };

  const value: LocationContextType = {
    ...state,
    getCurrentLocation,
    updateLocation,
            loadNearbyChatRooms: loadNearbyChatRoomsWrapper,
    createLocalChatRooms,
    setChatRoomsCallback: debugSetChatRoomsCallback,
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