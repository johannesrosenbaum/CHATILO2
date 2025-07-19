import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  AppBar,
  Toolbar,
  Slide,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Favorite,
  FavoriteOutlined,
  Download,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ImageGalleryProps {
  roomId: string;
  onClose: () => void;
}

interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  sender: {
    username: string;
    avatar?: string;
  };
  likes: string[];
  likesCount: number;
  createdAt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ roomId, onClose }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { likeMessage } = useSocket();

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat/rooms/${roomId}/images`);
      // Sort by likes count (most liked first)
      const sortedImages = response.data.sort((a: GalleryImage, b: GalleryImage) => 
        b.likesCount - a.likesCount
      );
      setImages(sortedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  const handleLike = (imageId: string) => {
    likeMessage(imageId);
    // Update local state optimistically
    setImages(prev => 
      prev.map(img => {
        if (img.id === imageId) {
          const isLiked = img.likes.includes(user?.id || '');
          return {
            ...img,
            likes: isLiked 
              ? img.likes.filter(id => id !== user?.id)
              : [...img.likes, user?.id || ''],
            likesCount: isLiked ? img.likesCount - 1 : img.likesCount + 1
          };
        }
        return img;
      })
    );
  };

  const handleDownload = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    link.click();
  };

  const isLikedByMe = (image: GalleryImage) => {
    return image.likes.includes(user?.id || '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Bildergalerie
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Sortiert nach den meisten Likes
        </Typography>
      </Box>

      {/* Gallery Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : images.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography color="text.secondary">
              Noch keine Bilder in diesem Chat
            </Typography>
          </Box>
        ) : (
          <ImageList variant="masonry" cols={2} gap={8}>
            {images.map((image) => (
              <ImageListItem
                key={image.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.filename}
                  loading="lazy"
                  style={{
                    borderRadius: 8,
                    width: '100%',
                    height: 'auto',
                  }}
                />
                <ImageListItemBar
                  title={image.sender.username}
                  subtitle={formatDate(image.createdAt)}
                  actionIcon={
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(image.id);
                        }}
                      >
                        {isLikedByMe(image) ? (
                          <Favorite sx={{ color: 'error.main' }} />
                        ) : (
                          <FavoriteOutlined />
                        )}
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255, 255, 255, 0.87)', mr: 1 }}
                      >
                        {image.likesCount}
                      </Typography>
                    </Box>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>

      {/* Full Screen Image Dialog */}
      <Dialog
        fullScreen
        open={Boolean(selectedImage)}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {selectedImage?.filename}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => selectedImage && handleDownload(selectedImage)}
            >
              <Download />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {selectedImage && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              bgcolor: 'black',
              p: 2,
            }}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              style={{
                maxWidth: '100%',
                maxHeight: '80%',
                objectFit: 'contain',
              }}
            />
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`Von ${selectedImage.sender.username}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={isLikedByMe(selectedImage) ? <Favorite /> : <FavoriteOutlined />}
                label={`${selectedImage.likesCount} Likes`}
                onClick={() => handleLike(selectedImage.id)}
                clickable
                color={isLikedByMe(selectedImage) ? 'error' : 'default'}
              />
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default ImageGallery;
