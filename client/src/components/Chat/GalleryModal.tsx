import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  TextField,
  Button,
  Slide,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Masonry } from '@mui/lab';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ChatBubble as ChatIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Transition = React.forwardRef<unknown, TransitionProps & {
  children: React.ReactElement;
}>((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} /> as React.ReactElement;
});

interface GalleryComment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

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
  comments: GalleryComment[];
  commentsCount: number;
  createdAt: string;
  type: 'image' | 'video';
}

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  onBackToChat: () => void;
  roomId: string;
  roomName: string;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ 
  open, 
  onClose, 
  onBackToChat,
  roomId, 
  roomName 
}) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chat/rooms/${roomId}/gallery`);
      // Sort by creation date (newest first)
      const sortedImages = response.data.sort((a: GalleryImage, b: GalleryImage) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setImages(sortedImages);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (open && roomId) {
      fetchImages();
    }
  }, [open, roomId, fetchImages]);

  const handleLike = async (imageId: string) => {
    try {
      await api.post(`/api/chat/gallery/${imageId}/like`);
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
      
      // Update selected image if it's the same
      if (selectedImage && selectedImage._id === imageId) {
        setSelectedImage(prev => {
          if (!prev) return null;
          const isLiked = prev.likes.includes(user?._id || '');
          return {
            ...prev,
            likes: isLiked 
              ? prev.likes.filter(id => id !== user?._id)
              : [...prev.likes, user?._id || ''],
            likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
          };
        });
      }
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const handleComment = async () => {
    // Comments feature not yet implemented
    console.log('Comments feature coming soon...');
    return;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `Vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `Vor ${Math.floor(diffInMinutes / 60)} Std`;
    if (diffInMinutes < 10080) return `Vor ${Math.floor(diffInMinutes / 1440)} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }
        }}
      >
        <AppBar
          sx={{ 
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Toolbar>
            <Typography sx={{ flex: 1, fontWeight: 600 }} variant="h6" component="div">
              Galerie - {roomName}
            </Typography>
            <Chip 
              label={`${images.length} Bilder`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                mr: 2
              }}
            />
            <Tooltip title="Zurück zum Chat">
              <IconButton
                color="inherit"
                onClick={onBackToChat}
                sx={{ mr: 1 }}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {loading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
              }}
            >
              <CircularProgress />
            </Box>
          ) : images.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Keine Bilder gefunden
              </Typography>
              <Typography variant="body2" color="textSecondary">
                In diesem Chat wurden noch keine Bilder geteilt.
              </Typography>
            </Box>
          ) : (
            <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
              <AnimatePresence>
                {images.map((image, index) => (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                        },
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                      onClick={() => setSelectedImage(image)}
                    >
                      <CardMedia
                        component={image.type === 'video' ? 'video' : 'img'}
                        image={image.url}
                        src={image.url}
                        alt={image.filename}
                        sx={{ 
                          height: 'auto',
                          aspectRatio: 'auto',
                          maxHeight: 300,
                          objectFit: 'cover',
                        }}
                        controls={image.type === 'video'}
                      />
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar 
                            src={image.user.avatar} 
                            alt={image.user.username}
                            sx={{ width: 24, height: 24 }}
                          >
                            {image.user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" color="textSecondary">
                            {image.user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            • {formatDate(image.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(image._id);
                            }}
                            sx={{ 
                              color: image.likes.includes(user?._id || '') ? '#e53e3e' : '#718096' 
                            }}
                          >
                            {image.likes.includes(user?._id || '') ? 
                              <FavoriteIcon fontSize="small" /> : 
                              <FavoriteBorderIcon fontSize="small" />
                            }
                          </IconButton>
                          <Typography variant="caption" color="textSecondary">
                            {image.likesCount}
                          </Typography>
                          
                          <IconButton size="small" sx={{ color: '#718096' }}>
                            <CommentIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" color="textSecondary">
                            {image.commentsCount}
                          </Typography>
                        </Box>
                      </CardActions>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Masonry>
          )}
        </Box>
      </Dialog>

      {/* Image Detail Dialog */}
      {selectedImage && (
        <Dialog
          fullScreen
          open={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            }
          }}
        >
          <AppBar
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Toolbar>
              <Typography sx={{ flex: 1, fontWeight: 600 }} variant="h6" component="div">
                Bild Details
              </Typography>
              <IconButton color="inherit" onClick={() => setSelectedImage(null)}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Grid container sx={{ height: '100%' }}>
            {/* Image Section */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Box
                component={selectedImage.type === 'video' ? 'video' : 'img'}
                src={selectedImage.url}
                alt={selectedImage.filename}
                controls={selectedImage.type === 'video'}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Grid>

            {/* Comments Section */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Paper 
                sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  m: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                {/* Image Info Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(102, 126, 234, 0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar 
                      src={selectedImage.user.avatar} 
                      alt={selectedImage.user.username}
                      sx={{ width: 32, height: 32 }}
                    >
                      {selectedImage.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {selectedImage.user.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(selectedImage.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      startIcon={selectedImage.likes.includes(user?._id || '') ? 
                        <FavoriteIcon /> : <FavoriteBorderIcon />}
                      onClick={() => handleLike(selectedImage._id)}
                      sx={{ 
                        color: selectedImage.likes.includes(user?._id || '') ? '#e53e3e' : '#667eea',
                        textTransform: 'none',
                      }}
                    >
                      {selectedImage.likesCount} Likes
                    </Button>
                    <Button
                      startIcon={<DownloadIcon />}
                      sx={{ color: '#667eea', textTransform: 'none' }}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>

                {/* Comments List */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {selectedImage.comments.map((comment) => (
                      <ListItem key={comment._id} sx={{ alignItems: 'flex-start' }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={comment.user.avatar} 
                            alt={comment.user.username}
                            sx={{ width: 32, height: 32 }}
                          >
                            {comment.user.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={500}>
                                {comment.user.username}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(comment.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={comment.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Comment Input */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(102, 126, 234, 0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Kommentar schreiben..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <IconButton 
                      onClick={handleComment}
                      disabled={!newComment.trim() || submittingComment}
                      sx={{ 
                        backgroundColor: '#667eea',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#5a67d8',
                        },
                        '&:disabled': {
                          backgroundColor: '#e2e8f0',
                        }
                      }}
                    >
                      {submittingComment ? <CircularProgress size={20} /> : <SendIcon />}
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Dialog>
      )}
    </>
  );
};

export default GalleryModal;
