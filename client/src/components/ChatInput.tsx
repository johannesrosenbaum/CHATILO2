import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Send,
  Image,
  VideoFile,
  Close
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSocket } from '../contexts/SocketContext';

const MediaPreview = styled(Box)(() => ({
  maxWidth: 200,
  maxHeight: 200,
  border: '2px dashed #667eea',
  borderRadius: 8,
  padding: 8,
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '& img, & video': {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 4
  }
}));

const ChatInput: React.FC = () => {
  const { sendMessage, uploadMedia } = useSocket();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Nur Bilder (JPEG, PNG, GIF, WebP) und Videos (MP4, WebM) sind erlaubt!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Datei ist zu groß! Maximum 10MB.');
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        setUploading(true);
        
        const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        const mediaUrl = await uploadMedia(selectedFile, mediaType);
        
        if (mediaUrl) {
          sendMessage(message || `Shared a ${mediaType}`, {
            type: selectedFile.type === 'image/gif' ? 'gif' : mediaType,
            url: mediaUrl,
            file: selectedFile
          });
        }
        
        setSelectedFile(null);
        setMediaPreview(null);
      } else {
        sendMessage(message);
      }
      
      setMessage('');
    } catch (error) {
      console.error('❌ Send error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 'auto' }}>
      {mediaPreview && (
        <MediaPreview>
          {selectedFile?.type.startsWith('image/') ? (
            <img src={mediaPreview} alt="Preview" />
          ) : (
            <video src={mediaPreview} controls style={{ maxWidth: '100%' }} />
          )}
          <IconButton
            size="small"
            onClick={() => {
              setSelectedFile(null);
              setMediaPreview(null);
            }}
            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <Close />
          </IconButton>
        </MediaPreview>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Image />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nachricht schreiben..."
          disabled={uploading}
          variant="outlined"
          size="small"
        />

        <IconButton
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || uploading}
          color="primary"
        >
          {uploading ? <CircularProgress size={20} /> : <Send />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInput;
