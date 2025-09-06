import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface FavoriteButtonProps {
  roomId: string;
  roomName: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const FavoriteButton = ({
  roomId,
  roomName,
  size = 'medium',
  color = '#f59e0b',
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // Favoriten aus localStorage laden
  useEffect(() => {
    if (user?.id) {
      const savedFavorites = localStorage.getItem(`chatilo_favorites_${user.id}`);
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorite(favorites.includes(roomId));
      }
    }
  }, [user?.id, roomId]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.id) return;

    const savedFavorites = localStorage.getItem(`chatilo_favorites_${user.id}`);
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== roomId);
    } else {
      newFavorites = [...favorites, roomId];
    }
    
    localStorage.setItem(`chatilo_favorites_${user.id}`, JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <Tooltip title={isFavorite ? `${roomName} aus Favoriten entfernen` : `${roomName} zu Favoriten hinzufügen`}>
      <IconButton
        size={size}
        onClick={handleToggleFavorite}
        sx={{
          color: isFavorite ? color : '#9ca3af',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: color,
            transform: 'scale(1.1)',
          },
        }}
      >
        {isFavorite ? <Star fontSize="inherit" /> : <StarBorder fontSize="inherit" />}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;
