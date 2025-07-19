import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { favoritesService } from '../services/favoritesService';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  roomId: string;
  roomName: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  roomId,
  roomName,
  onFavoriteChange,
  size = 'medium',
  color = 'primary'
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Lokale Speicherung für Favoriten (Fallback wenn Server nicht verfügbar)
  const getLocalFavorites = (): string[] => {
    try {
      const stored = localStorage.getItem('localFavorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setLocalFavorites = (favorites: string[]) => {
    try {
      localStorage.setItem('localFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Fehler beim Speichern der lokalen Favoriten:', error);
    }
  };

  // Beim Mount prüfen ob der Raum bereits in den Favoriten ist
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorite = await favoritesService.isFavorite(roomId);
        setIsFavorite(favorite);
      } catch (error) {
        console.error('Fehler beim Prüfen des Favoriten-Status:', error);
        // Fallback: Lokale Speicherung prüfen
        const localFavorites = getLocalFavorites();
        setIsFavorite(localFavorites.includes(roomId));
      }
    };

    checkFavoriteStatus();
  }, [roomId]);

  // Event-Listener für Favoriten-Updates
  useEffect(() => {
    const handleFavoritesUpdate = (event: CustomEvent) => {
      const { roomId: updatedRoomId, action } = event.detail;
      if (updatedRoomId === roomId) {
        setIsFavorite(action === 'add');
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener);
    };
  }, [roomId]);

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert Bubble-up zu parent elements
    
    if (isLoading) return;
    
    // Visuelles Feedback sofort beim Klick
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Animation für 300ms
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(roomId);
        setIsFavorite(false);
        // Lokale Speicherung aktualisieren
        const localFavorites = getLocalFavorites();
        setLocalFavorites(localFavorites.filter(id => id !== roomId));
        toast.success(`${roomName} aus Favoriten entfernt`);
        onFavoriteChange?.(false);
        
        // Event auslösen, um andere Komponenten zu benachrichtigen
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { roomId, action: 'remove' } }));
      } else {
        await favoritesService.addToFavorites(roomId);
        setIsFavorite(true);
        // Lokale Speicherung aktualisieren
        const localFavorites = getLocalFavorites();
        if (!localFavorites.includes(roomId)) {
          setLocalFavorites([...localFavorites, roomId]);
        }
        toast.success(`${roomName} zu Favoriten hinzugefügt`);
        onFavoriteChange?.(true);
        
        // Event auslösen, um andere Komponenten zu benachrichtigen
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { roomId, action: 'add' } }));
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der Favoriten:', error);
      // Fallback: Lokale Speicherung verwenden
      const localFavorites = getLocalFavorites();
      if (isFavorite) {
        // Aus Favoriten entfernen
        setLocalFavorites(localFavorites.filter(id => id !== roomId));
        setIsFavorite(false);
        toast.success(`${roomName} aus Favoriten entfernt (lokal)`);
        onFavoriteChange?.(false);
        
        // Event auslösen
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { roomId, action: 'remove' } }));
      } else {
        // Zu Favoriten hinzufügen
        if (!localFavorites.includes(roomId)) {
          setLocalFavorites([...localFavorites, roomId]);
        }
        setIsFavorite(true);
        toast.success(`${roomName} zu Favoriten hinzugefügt (lokal)`);
        onFavoriteChange?.(true);
        
        // Event auslösen
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { roomId, action: 'add' } }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip 
      title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      placement="top"
    >
      <IconButton
        onClick={handleToggleFavorite}
        disabled={isLoading}
        size={size}
        color={color}
        sx={{
          color: isFavorite ? '#ffd700' : 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            color: isFavorite ? '#ffed4e' : '#ffd700',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
          ...(isLoading && {
            opacity: 0.6,
            cursor: 'not-allowed',
          }),
          // Klick-Animation
          ...(isClicked && {
            transform: 'scale(1.3)',
            color: '#ffd700',
            filter: 'brightness(1.5) drop-shadow(0 0 15px #ffd700)',
            animation: 'starClick 0.3s ease-in-out',
            '@keyframes starClick': {
              '0%': { 
                transform: 'scale(1)',
                filter: 'brightness(1) drop-shadow(0 0 0px #ffd700)'
              },
              '50%': { 
                transform: 'scale(1.4)',
                filter: 'brightness(2) drop-shadow(0 0 20px #ffd700)'
              },
              '100%': { 
                transform: 'scale(1)',
                filter: 'brightness(1) drop-shadow(0 0 0px #ffd700)'
              }
            }
          }),
        }}
      >
        {isFavorite ? <StarIcon /> : <StarBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton; 