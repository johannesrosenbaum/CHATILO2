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

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  isSending,
  fileInputRef,
  placeholder = "Nachricht schreiben..."
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

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

  const handleSend = () => {
    if (!value.trim() && !selectedFile) return;
    if (selectedFile) {
      onFileUpload({ target: { files: [selectedFile] } } as any);
      setSelectedFile(null);
      setMediaPreview(null);
    } else {
      if (!value.trim()) return;
      onSend();
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
            disabled={isSending}
          >
            <Image />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={isSending}
          variant="outlined"
          size="small"
        />

        <IconButton
          onClick={handleSend}
          disabled={(!value.trim() && !selectedFile) || isSending}
          color="primary"
        >
          {isSending ? <CircularProgress size={20} /> : <Send />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInput;
