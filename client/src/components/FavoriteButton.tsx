import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useChat } from '../contexts/ChatContext';

interface FavoriteButtonProps {
  roomId: string;
  roomName?: string;
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
  const { favoriteRooms, toggleFavoriteRoom } = useChat();
  
  const isFavorite = favoriteRooms.includes(roomId);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert Room-Navigation beim Klick
    
    console.log('⭐ [FavoriteButton] Toggle für Raum:', roomId, roomName);
    
    toggleFavoriteRoom(roomId);
    
    // Callback aufrufen falls vorhanden
    onFavoriteChange?.(!isFavorite);
  };

  return (
    <Tooltip title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}>
      <IconButton 
        onClick={handleClick}
        size={size}
        sx={{ 
          color: isFavorite ? '#ffc107' : 'rgba(102, 126, 234, 0.5)',
          '&:hover': {
            color: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.08)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease',
          zIndex: 10, // Über anderen Elementen
        }}
      >
        {isFavorite ? <StarIcon /> : <StarBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;