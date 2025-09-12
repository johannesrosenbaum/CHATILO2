import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Send as SendIcon, 
  ArrowBack as ArrowBackIcon,
  Sort as SortIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatMessageTime } from '../utils/dateUtils';
import api from '../services/api';
import RedditPost from './RedditPost';
import FavoriteButton from './FavoriteButton';
import { getAvatarUrl } from '../utils/avatarUtils';

const ChatRoom: React.FC = () => {
  console.log('🌲 ChatRoom component rendering... REDDIT-STYLE ACTIVE!!! 🎨');
  
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    socket, 
    currentRoom, 
    joinRoom, 
    user,
    chatRooms 
  } = useSocket();
  
  // Reddit-Style State
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('🔧 ChatRoom State:');
  console.log('   roomId from URL:', roomId);
  console.log('   currentRoom:', currentRoom);
  console.log('   posts count:', posts?.length || 0);
  console.log('   user:', user?.username);
  console.log('   socket connected:', !!socket);

  // Find current room info
  const currentRoomInfo = chatRooms?.find(room => 
    room._id === roomId || room.id === roomId ||
    room.name.toLowerCase().includes(roomId?.split('_')[1] || '')
  );

  console.log('🔧 Current room info:', currentRoomInfo?.name);

  // Join room and load posts
  useEffect(() => {
    if (roomId && socket) {
      console.log('🚪 ChatRoom component: Joining room', roomId);
      joinRoom(roomId);
      loadPosts();
    }
  }, [roomId, socket, joinRoom, sortBy]);

  // Load Reddit-style posts
  const loadPosts = async (page = 1) => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      console.log(`🌲 Loading posts for room ${roomId}, sort: ${sortBy}, page: ${page}`);
      
      const response = await api.get(`/api/chat/rooms/${roomId}/messages`, {
        params: { page, limit: 20, sortBy }
      });

      const { posts: newPosts, pagination: newPagination } = response.data;
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setPagination(newPagination);
      console.log(`🌲 Loaded ${newPosts.length} posts, total pages: ${newPagination.totalPages}`);
      
    } catch (error) {
      console.error('❌ Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (newPostContent.trim() === '' || !user || !roomId) return;

    setLoading(true);
    try {
      console.log('📝 Creating new post:', newPostContent);
      
      const response = await api.post(`/api/chat/rooms/${roomId}/messages`, {
        content: newPostContent,
        isPost: true
      });

      const newPost = response.data;
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setShowNewPost(false);
      
      console.log('✅ Post created successfully');
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed legacy message handling functions - now using Reddit-style posts

  const handleBack = () => {
    navigate('/chat');
  };

  // Sort menu handlers
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSortAnchorEl(null);
    setPagination({ currentPage: 1, totalPages: 1, hasNextPage: false });
  };

  // Post interaction handlers
  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    try {
      const response = await api.post(`/api/chat/messages/${messageId}/vote`, {
        voteType
      });
      
      // Update the post in state
      setPosts(prev => prev.map(post => {
        if (post._id === messageId) {
          return { ...post, ...response.data };
        }
        return updatePostRecursive(post, messageId, response.data);
      }));
      
    } catch (error) {
      console.error('❌ Error voting:', error);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const response = await api.post(`/api/chat/messages/${parentId}/reply`, {
        content
      });
      
      // Update the post with new reply
      setPosts(prev => prev.map(post => {
        if (post._id === parentId) {
          return {
            ...post,
            children: [...(post.children || []), response.data],
            childrenCount: (post.childrenCount || 0) + 1
          };
        }
        return updatePostRecursive(post, parentId, null, response.data);
      }));
      
    } catch (error) {
      console.error('❌ Error replying:', error);
    }
  };

  // Helper function to update posts recursively
  const updatePostRecursive = (post: any, targetId: string, update?: any, newReply?: any): any => {
    if (post._id === targetId) {
      if (update) return { ...post, ...update };
      if (newReply) return {
        ...post,
        children: [...(post.children || []), newReply],
        childrenCount: (post.childrenCount || 0) + 1
      };
    }
    
    if (post.children?.length) {
      return {
        ...post,
        children: post.children.map((child: any) => 
          updatePostRecursive(child, targetId, update, newReply)
        )
      };
    }
    
    return post;
  };

  // Load more posts (pagination)
  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loading) {
      loadPosts(pagination.currentPage + 1);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 🔥 STARK VERBESSERTE Message-Anzeige - MAXIMALE User-Daten Extraktion
  const getUserDisplayInfo = (message: any) => {
    console.log('🔧 RAW Message object for user extraction:', message);
    console.log('   Available keys:', Object.keys(message));
    
    // 🔥 BEREINIGTER Username-Extraktion - nur notwendige Felder
    const username = message.username || 
                    message.sender?.username || 
                    message.user?.username ||
                    'Unbekannt';
    
    // 🔥 BEREINIGTER UserID-Extraktion - nur notwendige Felder
    const userId = message.userId || 
                  message.sender?._id || 
                  message.sender?.id ||
                  message.user?._id || 
                  message.user?.id ||
                  'unknown';

    console.log('🔧 FINAL Extracted user info:', { 
      username, 
      userId, 
      currentUser: user?.username,
      extractionSource: {
        usernameFrom: message.username ? 'message.username' :
                     message.sender?.username ? 'message.sender.username' :
                     message.user?.username ? 'message.user.username' : 'fallback',
        userIdFrom: message.userId ? 'message.userId' :
                   message.sender?._id ? 'message.sender._id' :
                   message.sender?.id ? 'message.sender.id' :
                   message.user?._id ? 'message.user._id' :
                   message.user?.id ? 'message.user.id' : 'fallback'
      }
    });

    return { username, userId };
  };

  // 🔥 VOLLSTÄNDIG KORRIGIERTE isOwnMessage mit DEBUG
  const isOwnMessage = useCallback((message: any) => {
    const { username: msgUsername, userId: msgUserId } = getUserDisplayInfo(message);
    
    // 🔥 CRITICAL: String-Konvertierung für ALLE User-IDs
    const currentUserId = String(user?._id || user?.id || '');
    const currentUsername = String(user?.username || '');
    const messageUserId = String(msgUserId || '');
    const messageUsername = String(msgUsername || '');
    
    console.log('🔥 FINAL isOwnMessage CHECK:');
    console.log('   Message content:', message.content?.substring(0, 30) + '...');
    console.log('   💡 CURRENT USER:');
    console.log('     - ID (string):', `"${currentUserId}"`);
    console.log('     - Username (string):', `"${currentUsername}"`);
    console.log('   💡 MESSAGE USER:');
    console.log('     - ID (string):', `"${messageUserId}"`);
    console.log('     - Username (string):', `"${messageUsername}"`);
    
    // 🔥 ERWEITERTE CHECKS mit detailliertem Logging
    const idMatch = currentUserId.length > 0 && 
                   messageUserId.length > 0 && 
                   currentUserId === messageUserId;
                   
    const usernameMatch = currentUsername.length > 0 && 
                         messageUsername.length > 0 && 
                         currentUsername === messageUsername;
    
    console.log('   💡 MATCH ANALYSIS:');
    console.log('     - Both IDs available:', currentUserId.length > 0 && messageUserId.length > 0);
    console.log('     - IDs match exactly:', currentUserId === messageUserId);
    console.log('     - ID Match Result:', idMatch);
    console.log('     - Both usernames available:', currentUsername.length > 0 && messageUsername.length > 0);
    console.log('     - Usernames match exactly:', currentUsername === messageUsername);
    console.log('     - Username Match Result:', usernameMatch);
    
    const isOwn = idMatch || usernameMatch;
    
    console.log('   🎯 FINAL DECISION:', isOwn ? '✅ OWN MESSAGE (RIGHT)' : '❌ OTHER MESSAGE (LEFT)');
    console.log('   🎯 Based on:', idMatch ? 'User ID match' : usernameMatch ? 'Username match' : 'No match found');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return isOwn;
  }, [user]);

  // 🔥 NEUER FALLBACK: Wenn currentRoom null ist, verwende roomId
  const activeRoom = currentRoom || roomId;
  
  console.log('🔧 ChatRoom Active Room Analysis:');
  console.log('   currentRoom from context:', currentRoom);
  console.log('   roomId from URL:', roomId);
  console.log('   activeRoom (final):', activeRoom);
  console.log('   posts available:', posts?.length || 0);

  // 🔥 KORRIGIERTE MESSAGE DARSTELLUNG - AUCH OHNE currentRoom
  const shouldShowPosts = posts && posts.length > 0;
  const effectiveRoom = currentRoom || roomId; // Fallback auf roomId

  console.log('🔧 ChatRoom MESSAGE DISPLAY LOGIC:');
  console.log('   posts.length:', posts?.length || 0);
  console.log('   currentRoom:', currentRoom);
  console.log('   roomId from URL:', roomId);
  console.log('   effectiveRoom:', effectiveRoom);
  console.log('   shouldShowPosts:', shouldShowPosts);

  if (!socket) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Verbindung wird hergestellt...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Reddit-Style Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 0,
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleBack} 
            edge="start" 
            sx={{ color: '#667eea' }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 40,
              height: 40,
              fontSize: '1rem',
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            {currentRoomInfo?.name?.charAt(0).toUpperCase() || 'R'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c' }}>
              r/{currentRoomInfo?.name || 'chatroom'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#718096' }}>
              {posts.length} posts • {activeRoom ? 'Live' : 'Connecting...'}
            </Typography>
          </Box>

          {/* Sort Menu */}
          <IconButton onClick={handleSortClick} sx={{ color: '#4a5568' }}>
            <SortIcon />
          </IconButton>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            <MenuItem onClick={() => handleSortChange('latest')} selected={sortBy === 'latest'}>
              🕒 Latest
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('hot')} selected={sortBy === 'hot'}>
              🔥 Hot
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('top')} selected={sortBy === 'top'}>
              ⭐ Top
            </MenuItem>
          </Menu>

          {/* New Post Button */}
          <IconButton 
            onClick={() => setShowNewPost(!showNewPost)}
            sx={{ 
              bgcolor: '#667eea', 
              color: 'white',
              '&:hover': { bgcolor: '#5a6fd8' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* New Post Form */}
        {showNewPost && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Was möchtest du diskutieren?"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowNewPost(false)} variant="outlined">
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost} 
                variant="contained"
                disabled={!newPostContent.trim() || loading}
                sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5a6fd8' } }}
              >
                Post
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Reddit-Style Feed */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        bgcolor: '#f8fafc'
      }}>
        {loading && posts.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px'
          }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            textAlign: 'center',
            p: 3
          }}>
            <Typography variant="h5" sx={{ color: '#4a5568', mb: 2, fontWeight: 600 }}>
              🌟 Sei der Erste!
            </Typography>
            <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
              Erstelle den ersten Post und starte die Diskussion in diesem Raum.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowNewPost(true)}
              sx={{ 
                bgcolor: '#667eea', 
                '&:hover': { bgcolor: '#5a6fd8' },
                borderRadius: 3,
                px: 3
              }}
            >
              Ersten Post erstellen
            </Button>
          </Box>
        ) : (
          <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
            {/* Posts Feed */}
            {posts.map((post) => (
              <RedditPost
                key={post._id}
                post={post}
                onVote={handleVote}
                onReply={handleReply}
                currentUserId={user?._id}
              />
            ))}
            
            {/* Load More Button */}
            {pagination.hasNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Mehr laden'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatRoom;
