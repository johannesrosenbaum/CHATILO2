import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Avatar,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  ChatBubble as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface GalleryImage {
  _id: string;
  messageId: string;
  url: string;
  filename: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  likesCount: number;
  comments: any[];
  commentsCount: number;
  createdAt: string;
  type: 'image' | 'video';
}

interface CollageGalleryProps {
  roomId: string;
  roomName: string;
  onBackToChat: () => void;
  isVisible: boolean;
  hideBackButton?: boolean; // New prop to hide the back button
}

function CollageGallery({
  roomId,
  roomName,
  onBackToChat,
  isVisible,
  hideBackButton = false,
}: CollageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isMountedRef = useRef(true);

  // Debug wrapper for onBackToChat
  const handleBackToChat = useCallback(() => {
    console.log('[CollageGallery] handleBackToChat called');
    onBackToChat();
  }, [onBackToChat]);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('[CollageGallery] Component mounted, isVisible:', isVisible);
    return () => { 
      console.log('[CollageGallery] Component unmounting');
      isMountedRef.current = false; 
    };
  }, []);

  const fetchImages = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/rooms/${roomId}/gallery`);
      if (!isMountedRef.current) return;

      // DEBUG: log raw API response for troubleshooting
      console.debug('[CollageGallery] fetchImages raw response.data:', response?.data);

      // Normalize possible response shapes so client works with different API formats
      let items: GalleryImage[] = [];
      const data = response.data;

      if (Array.isArray(data)) {
        items = data as GalleryImage[];
      } else if (data?.gallery && Array.isArray(data.gallery.items)) {
        items = data.gallery.items as GalleryImage[];
      } else if (data?.gallery && Array.isArray(data.gallery.media)) {
        items = data.gallery.media as GalleryImage[];
      } else if (Array.isArray(data?.items)) {
        items = data.items as GalleryImage[];
      } else if (Array.isArray(data?.media)) {
        items = data.media as GalleryImage[];
      } else if (Array.isArray(data?.gallery)) {
        items = data.gallery as GalleryImage[];
      } else if (data && typeof data === 'object') {
        // fallback: pick first array property if present
        for (const key of Object.keys(data)) {
          if (Array.isArray((data as any)[key])) {
            items = (data as any)[key] as GalleryImage[];
            break;
          }
        }
      }

      if (!Array.isArray(items)) items = [];

      // DEBUG: log normalized items
      console.debug('[CollageGallery] fetchImages normalized items count:', items.length, items.slice(0, 3));

      // Sortiere Bilder nach Engagement-Score (Likes + Comments + Aktualität)
      const sortedImages = [...items].sort((a: GalleryImage, b: GalleryImage) => {
        const scoreA = calculateEngagementScore(a);
        const scoreB = calculateEngagementScore(b);
        return scoreB - scoreA;
      });

      setImages(sortedImages);
    } catch (err: any) {
      console.error('Error fetching gallery images:', err, err?.response?.data);
      if (!isMountedRef.current) return;
      setError(err?.response?.data?.message || err.message || 'Fehler beim Laden der Galerie');
      setImages([]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [roomId]);

  const calculateEngagementScore = (image: GalleryImage): number => {
    const now = new Date().getTime();
    const imageTime = new Date(image.createdAt).getTime();
    const ageInHours = (now - imageTime) / (1000 * 60 * 60);
    
    // Gewichtung: Likes (3x), Comments (5x), Aktualität (1/ageInHours)
    const likesScore = image.likesCount * 3;
    const commentsScore = image.commentsCount * 5;
    const freshnessScore = Math.max(0, 24 - ageInHours); // Bonus für frische Bilder
    
    return likesScore + commentsScore + freshnessScore;
  };

  const getSizeClass = (index: number, engagementScore: number): string => {
    // Top 3 Bilder mit höchstem Engagement bekommen große Größen
    if (index === 0) return 'large'; // Größtes Bild
    if (index === 1 || index === 2) return 'medium';
    if (engagementScore > 10) return 'medium';
    return 'small';
  };

  const handleLike = async (imageId: string) => {
    try {
      await axios.post(`/api/chat/gallery/${imageId}/like`);
      setImages(prev => 
        prev.map(img => {
          if (img._id === imageId) {
            const isLiked = img.likes.includes(user?._id || '');
            return {
              ...img,
              likes: isLiked 
                ? img.likes.filter(id => id !== user?._id)
                : [...img.likes, user?._id || ''],
              likesCount: isLiked ? img.likesCount - 1 : img.likesCount + 1,
            };
          }
          return img;
        })
      );
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  useEffect(() => {
    if (isVisible && roomId) {
      console.log('[CollageGallery] Fetching images for room:', roomId);
      fetchImages();
    }
    // Do NOT clear images here on toggle. Keeping images avoids flicker when the gallery
    // is mounted after the flip animation. Images are cleared on unmount or when a new
    // room's gallery is fetched.
  }, [isVisible, roomId, fetchImages]);

  // ensure images are cleared when the component actually unmounts
  useEffect(() => {
    return () => {
      setImages([]);
    };
  }, []);

  const seedDemoImages = () => {
    const now = new Date();
    const demo = [
      {
        _id: `demo-${now.getTime()}-1`,
        messageId: `demo-msg-1`,
        url: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=80&auto=format&fit=crop',
        filename: 'demo1.jpg',
        user: { _id: user?._id || 'demo-user', username: user?.username || 'Demo' },
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        createdAt: now.toISOString(),
        type: 'image' as const,
      },
      {
        _id: `demo-${now.getTime()}-2`,
        messageId: `demo-msg-2`,
        url: 'https://images.unsplash.com/photo-1495697112636-15c3b3b7d3c2?w=1200&q=80&auto=format&fit=crop',
        filename: 'demo2.jpg',
        user: { _id: user?._id || 'demo-user', username: user?.username || 'Demo' },
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        createdAt: now.toISOString(),
        type: 'image' as const,
      },
      {
        _id: `demo-${now.getTime()}-3`,
        messageId: `demo-msg-3`,
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop',
        filename: 'demo3.jpg',
        user: { _id: user?._id || 'demo-user', username: user?.username || 'Demo' },
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        createdAt: now.toISOString(),
        type: 'image' as const,
      },
    ];
    setImages(demo);
    setError(null);
    setLoading(false);
  };

  console.log('[CollageGallery] Rendering with isVisible:', isVisible, 'images:', images.length);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, maxWidth: 640, width: '100%' }} elevation={3}>
          <Typography variant="h6" sx={{ mb: 1 }}>Fehler beim Laden der Galerie</Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{error}</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <IconButton onClick={handleBackToChat} title="Zurück zum Chat">
              <CloseIcon />
            </IconButton>
            <Chip label="Erneut versuchen" onClick={fetchImages} clickable color="primary" />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header mit Chat-Switch Button */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        {!hideBackButton && (
          <Tooltip title="Zurück zum Chat">
            <IconButton
              onClick={handleBackToChat}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ChatIcon />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Galerie - {roomName}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {images.length} Bilder & Videos
          </Typography>
        </Box>

        <Chip 
          label="Kollage"
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 500,
          }}
        />
      </Paper>

      {/* Kollage Grid */}
      <Box sx={{ p: 2, height: 'calc(100vh - 80px)', overflow: 'auto' }}>
        {images.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '60vh',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h5" color="textSecondary" sx={{ fontWeight: 300 }}>
              Noch keine Medien
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Teile Fotos und Videos, um die Galerie zu füllen!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={fetchImages}>Erneut laden</Button>
              <Button variant="outlined" onClick={seedDemoImages}>Demo-Medien anzeigen</Button>
              <Button variant="text" onClick={handleBackToChat}>Zurück zum Chat</Button>
            </Box>
          </Box>
        ) : (
           <Box
             sx={{
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
               gap: 2,
               gridAutoRows: 'minmax(150px, auto)',
             }}
           >
            <AnimatePresence>
              {images.map((image, index) => {
                const sizeClass = getSizeClass(index, calculateEngagementScore(image));
                const isLiked = image.likes.includes(user?._id || '');
                
                return (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    style={{
                      gridRowEnd: sizeClass === 'large' ? 'span 3' : 
                                 sizeClass === 'medium' ? 'span 2' : 'span 1',
                      gridColumnEnd: sizeClass === 'large' && index === 0 ? 'span 2' : 'span 1',
                    }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.02)',
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.25)',
                        },
                        boxShadow: sizeClass === 'large' ? 
                          '0 8px 32px rgba(102, 126, 234, 0.2)' : 
                          '0 4px 20px rgba(102, 126, 234, 0.1)',
                      }}
                    >
                      {/* Bild/Video */}
                      <CardMedia
                        component={image.type === 'video' ? 'video' : 'img'}
                        image={image.url}
                        src={image.url}
                        alt={image.filename}
                        controls={image.type === 'video'}
                        sx={{ 
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />

                      {/* Overlay mit Engagement-Infos */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0,0,0,0.8) 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          p: sizeClass === 'large' ? 2 : 1,
                        }}
                      >
                        {/* Top Badges */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          {sizeClass === 'large' && (
                            <Chip 
                              label="Top Bild" 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(255, 215, 0, 0.9)',
                                color: 'black',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                          <Chip 
                            label={formatDate(image.createdAt)}
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              backdropFilter: 'blur(10px)',
                              fontSize: '0.7rem'
                            }} 
                          />
                        </Box>

                        {/* Bottom Info */}
                        <Box>
                          {/* User Info - nur bei größeren Bildern */}
                          {sizeClass !== 'small' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar 
                                src={image.user.avatar} 
                                alt={image.user.username}
                                sx={{ width: 24, height: 24 }}
                              >
                                {image.user.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'white',
                                  fontWeight: 500,
                                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                }}
                              >
                                {image.user.username}
                              </Typography>
                            </Box>
                          )}

                          {/* Engagement Actions */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(image._id);
                              }}
                              sx={{ 
                                color: isLiked ? '#ff4757' : 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isLiked ? 
                                <FavoriteIcon fontSize="small" /> : 
                                <FavoriteBorderIcon fontSize="small" />
                              }
                            </IconButton>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'white',
                                fontWeight: 600,
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                              }}
                            >
                              {image.likesCount}
                            </Typography>
                            
                            {image.commentsCount > 0 && (
                              <>
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                  }}
                                >
                                  <CommentIcon fontSize="small" />
                                </IconButton>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'white',
                                    fontWeight: 600,
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                  }}
                                >
                                  {image.commentsCount}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CollageGallery;
