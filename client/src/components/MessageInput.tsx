import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Send,
  AttachFile,
  PhotoCamera,
  Videocam,
  Mic,
  InsertDriveFile,
  Close,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';

interface MessageInputProps {
  roomId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [attachMenuAnchor, setAttachMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, currentRoom } = useSocket();

  const handleSendMessage = () => {
    if (!message.trim() || !currentRoom || uploading) {
      console.warn('❌ Cannot send message: missing content or room', { message: message.trim(), currentRoom });
      return;
    }
    console.log(`📤 Sending message to room ${currentRoom}: ${message.trim()}`);
    sendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachClick = (event: React.MouseEvent<HTMLElement>) => {
    setAttachMenuAnchor(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAttachMenuAnchor(null);
  };

  const handleFileSelect = (acceptedTypes: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes;
      fileInputRef.current.click();
    }
    handleAttachClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle images specifically
    if (file.type.startsWith('image/')) {
      handleImageUpload(event);
      return;
    }

    // Handle other files
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      // Für jetzt nur eine einfache Nachricht senden
      sendMessage(`📎 Datei: ${selectedFile.name}`);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <PhotoCamera />;
    if (file.type.startsWith('video/')) return <Videocam />;
    if (file.type.startsWith('audio/')) return <Mic />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) {
      console.warn('❌ Cannot send message: missing content or room', { message: message.trim(), currentRoom });
      return;
    }
    console.log(`📤 Sending message to room ${currentRoom}: ${message.trim()}`);
    sendMessage(message.trim());
    setMessage('');
  };

  const handleSend = () => {
    if (!message.trim() || !currentRoom) {
      console.warn('⚠️ Empty message or no current room');
      return;
    }

    console.log('📤 Sending message to room:', currentRoom);
    sendMessage(message.trim());
    setMessage('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.warn('❌ Invalid file type - only images allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn('❌ File too large - max 5MB allowed');
      return;
    }

    console.log('📷 Processing image upload:', file.name);
    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('roomId', currentRoom || '');

      // Upload to server
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Image uploaded successfully:', data.imageUrl);
        
        // Send message with image URL from server
        sendMessage(`[IMAGE]${data.imageUrl}`);
      } else {
        console.error('❌ Image upload failed');
        // Fallback to base64 if server upload fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target?.result as string;
          sendMessage(`[IMAGE]${base64Data}`);
          setUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      // Fallback to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        sendMessage(`[IMAGE]${base64Data}`);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    setUploading(false);
    // Reset input
    event.target.value = '';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Selected File Preview */}
      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={getFileIcon(selectedFile)}
            label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
            onDelete={handleRemoveFile}
            deleteIcon={<Close />}
            color="primary"
            variant="outlined"
            sx={{ maxWidth: '100%' }}
          />
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        {/* Attach Button */}
        <IconButton
          onClick={handleAttachClick}
          color="primary"
          disabled={uploading}
        >
          <AttachFile />
        </IconButton>

        {/* Message Input */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Nachricht schreiben..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          disabled={uploading}
        />

        {/* Send Button */}
        <IconButton
          type="submit"
          color="primary"
          disabled={(!message.trim() && !selectedFile) || uploading}
        >
          {uploading ? <CircularProgress size={24} /> : <Send />}
        </IconButton>
      </Box>

      {/* Attachment Menu */}
      <Menu
        anchorEl={attachMenuAnchor}
        open={Boolean(attachMenuAnchor)}
        onClose={handleAttachClose}
      >
        <MenuItem onClick={() => handleFileSelect('image/*')}>
          <PhotoCamera sx={{ mr: 1 }} />
          Foto
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect('video/*')}>
          <Videocam sx={{ mr: 1 }} />
          Video
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect('audio/*')}>
          <Mic sx={{ mr: 1 }} />
          Audio
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect('*')}>
          <InsertDriveFile sx={{ mr: 1 }} />
          Datei
        </MenuItem>
      </Menu>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />
    </Paper>
  );
};

export default MessageInput;
