import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Collapse,
  Divider,
  Chip
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Reply as ReplyIcon,
  ExpandMore,
  ExpandLess,
  Forum
} from '@mui/icons-material';
import { formatMessageTime } from '../utils/dateUtils';
import { getAvatarUrl } from '../utils/avatarUtils';

interface Comment {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  level: number;
  replies: Comment[];
  replyCount: number;
  upvotes?: any[];
  downvotes?: any[];
  score: number;
  netScore: number;
}

interface Post {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  comments: Comment[];
  commentCount: number;
  upvotes?: any[];
  downvotes?: any[];
  score: number;
  childrenCount: number;
}

interface RedditPostProps {
  post: Post;
  currentUserId?: string;
  onVote: (messageId: string, voteType: 'up' | 'down' | 'remove') => Promise<void>;
  onReply: (messageId: string, content: string) => Promise<void>;
}

const RedditPost: React.FC<RedditPostProps> = ({ 
  post, 
  currentUserId,
  onVote,
  onReply 
}) => {
  const [showComments, setShowComments] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    await onVote(messageId, voteType);
  };

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    
    await onReply(messageId, replyContent.trim());
    setReplyContent('');
    setReplyingTo(null);
  };

  const toggleComment = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getUserVote = (message: Post | Comment) => {
    if (!currentUserId) return null;
    
    const hasUpvote = message.upvotes?.some(vote => vote.user === currentUserId);
    const hasDownvote = message.downvotes?.some(vote => vote.user === currentUserId);
    
    if (hasUpvote) return 'up';
    if (hasDownvote) return 'down';
    return null;
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const userVote = getUserVote(comment);
    const isExpanded = expandedComments.has(comment._id);
    const maxDepth = 6;
    
    return (
      <Box key={comment._id} sx={{ ml: depth * 2, mt: 1 }}>
        {/* Thread Line */}
        {depth > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: depth * 16 - 8,
              top: 0,
              bottom: 0,
              width: '2px',
              bgcolor: `hsl(${(depth * 60) % 360}, 60%, 70%)`,
              opacity: 0.6
            }}
          />
        )}
        
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: depth % 2 === 0 ? '#fafafa' : '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            position: 'relative',
            ml: depth > 0 ? 2 : 0
          }}
        >
          {/* Comment Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar
              src={getAvatarUrl(comment.sender.avatar || comment.sender._id)}
              sx={{ width: 24, height: 24 }}
            >
              {comment.sender.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {comment.sender.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              • {formatMessageTime(comment.createdAt)}
            </Typography>
            <Chip 
              label={`L${comment.level}`} 
              size="small" 
              sx={{ 
                height: 16, 
                fontSize: '0.6rem',
                bgcolor: `hsl(${(depth * 60) % 360}, 60%, 90%)`
              }} 
            />
          </Box>

          {/* Comment Content */}
          <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>

          {/* Comment Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleVote(comment._id, 'up')}
              color={userVote === 'up' ? 'primary' : 'default'}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ minWidth: '20px', textAlign: 'center' }}>
              {comment.netScore || 0}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleVote(comment._id, 'down')}
              color={userVote === 'down' ? 'error' : 'default'}
            >
              <ThumbDown fontSize="small" />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              disabled={depth >= maxDepth}
            >
              <ReplyIcon fontSize="small" />
            </IconButton>
            
            {comment.replies.length > 0 && (
              <Button
                size="small"
                startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                onClick={() => toggleComment(comment._id)}
                sx={{ ml: 1, fontSize: '0.75rem' }}
              >
                {comment.replies.length} replies
              </Button>
            )}
          </Box>

          {/* Reply Form */}
          <Collapse in={replyingTo === comment._id}>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleReply(comment._id)}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="small"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>

        {/* Nested Replies */}
        <Collapse in={isExpanded || expandedComments.has(comment._id)}>
          {comment.replies.map((reply) => 
            renderComment(reply, Math.min(depth + 1, maxDepth))
          )}
        </Collapse>
      </Box>
    );
  };

  const userVote = getUserVote(post);

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        bgcolor: '#ffffff'
      }}
    >
      {/* Post Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={getAvatarUrl(post.sender.avatar || post.sender._id)}
            sx={{ width: 40, height: 40 }}
          >
            {post.sender.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {post.sender.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatMessageTime(post.createdAt)}
            </Typography>
          </Box>
          <Chip label="POST" color="primary" size="small" />
        </Box>

        {/* Post Content */}
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>

        {/* Post Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => handleVote(post._id, 'up')}
            color={userVote === 'up' ? 'primary' : 'default'}
          >
            <ThumbUp />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
            {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
          </Typography>
          <IconButton
            onClick={() => handleVote(post._id, 'down')}
            color={userVote === 'down' ? 'error' : 'default'}
          >
            <ThumbDown />
          </IconButton>

          <IconButton
            onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
          >
            <ReplyIcon />
          </IconButton>

          <Button
            startIcon={<Forum />}
            onClick={() => setShowComments(!showComments)}
            sx={{ ml: 2 }}
          >
            {post.commentCount} Comments
          </Button>
        </Box>

        {/* Reply to Post Form */}
        <Collapse in={replyingTo === post._id}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => handleReply(post._id)}
                disabled={!replyContent.trim()}
              >
                Comment
              </Button>
              <Button onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ p: 2, pt: 1 }}>
          {post.comments.length > 0 ? (
            <Box sx={{ position: 'relative' }}>
              {post.comments.map((comment) => renderComment(comment, 0))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default RedditPost;
