import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  CameraAlt,
  PhotoCamera
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

// Styled Components
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(2),
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '2px solid rgba(255, 255, 255, 0.3)',
  padding: theme.spacing(4),
  color: theme.palette.text.primary,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const ChatiloIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px auto',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
}));

const ChatiloSymbol = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '28px',
  fontWeight: 'bold',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: '4px solid rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
  }
}));

const AvatarOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 1,
  }
}));

const BioTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  }
}));

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [uploading, setUploading] = useState(false);
  
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '' // BIO HINZUGEFÜGT
  });

  // Avatar Upload Handler
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('👤 Avatar uploaded successfully:', result.avatar);
        setSnackbar({ 
          open: true, 
          message: 'Avatar erfolgreich hochgeladen!', 
          severity: 'success' 
        });
        // Refresh user data
        window.location.reload(); // Simple refresh for now
      } else {
        console.error('❌ Avatar upload failed:', result.error);
        setSnackbar({ 
          open: true, 
          message: 'Fehler beim Hochladen: ' + result.error, 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Fehler beim Hochladen des Avatars', 
        severity: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validierung
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSnackbar({ 
          open: true, 
          message: 'Datei ist zu groß. Maximum 5MB erlaubt.', 
          severity: 'error' 
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSnackbar({ 
          open: true, 
          message: 'Nur Bild-Dateien sind erlaubt.', 
          severity: 'error' 
        });
        return;
      }

      // Upload direkt
      handleAvatarUpload(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setSelectedImage(null);
  };

  const handleSave = async () => {
    try {
      // TODO: API-Call zum Speichern der Profildaten
      console.log('Speichere Profildaten:', editData, selectedImage);
      
      setSnackbar({ 
        open: true, 
        message: 'Profil erfolgreich aktualisiert!', 
        severity: 'success' 
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Fehler beim Speichern des Profils.', 
        severity: 'error' 
      });
    }
  };

  return (
    <GradientBackground>
      <Container maxWidth="md">
        <GlassCard elevation={0}>
          {/* ZURÜCK BUTTON */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/chat')}
              sx={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)',
                color: 'primary.main',
                fontWeight: 600,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  transform: 'translateX(-5px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zum Chat
            </Button>
          </Box>

          {/* PROFIL HEADER */}
          <Box textAlign="center" mb={4}>
            <ChatiloIcon>
              <ChatiloSymbol>C</ChatiloSymbol>
            </ChatiloIcon>
            
            <Typography 
              variant="h3"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 1,
              }}
            >
              Mein Profil
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ fontWeight: 500, opacity: 0.8 }}
            >
              Verwalte deine CHATILO Einstellungen
            </Typography>
          </Box>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          
          {/* Profile Picture & Info */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{ position: 'relative' }}>
              <ProfileAvatar
                src={selectedImage || user?.avatar || undefined}
                onClick={handleAvatarClick}
              >
                {user?.username?.charAt(0).toUpperCase()}
                <AvatarOverlay>
                  <PhotoCamera sx={{ color: 'white', fontSize: 30 }} />
                </AvatarOverlay>
              </ProfileAvatar>
              
              <Tooltip title="Profilbild ändern" placement="top">
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography variant="h6" color="primary">
              {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mitglied seit {new Date(user?.createdAt || Date.now()).toLocaleDateString('de-DE')}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Profile Information */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom color="text.primary">
              Persönliche Informationen
            </Typography>
            
            <Box mb={2}>
              <TextField
                fullWidth
                label="Benutzername"
                value={isEditing ? editData.username : user?.username || ''}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: isEditing ? 'background.paper' : 'rgba(0,0,0,0.05)'
                  }
                }}
              />
            </Box>
            
            <Box mb={2}>
              <TextField
                fullWidth
                label="E-Mail"
                value={isEditing ? editData.email : user?.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: isEditing ? 'background.paper' : 'rgba(0,0,0,0.05)'
                  }
                }}
              />
            </Box>

            {/* BIO FIELD HINZUGEFÜGT */}
            <Box mb={2}>
              <BioTextField
                fullWidth
                multiline
                rows={3}
                label="Über mich"
                placeholder="Erzähle etwas über dich... (max. 200 Zeichen)"
                value={isEditing ? editData.bio : user?.bio || ''}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setEditData({ ...editData, bio: e.target.value });
                  }
                }}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
                helperText={isEditing ? `${editData.bio.length}/200 Zeichen` : ''}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: isEditing ? 'background.paper' : 'rgba(0,0,0,0.05)'
                  }
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* SETTINGS ENTFERNT - nur Edit/Save Buttons */}
          <Box display="flex" justifyContent="center" gap={2}>
            {!isEditing ? (
              <Button
                startIcon={<Edit />}
                onClick={handleEdit}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Profil bearbeiten
              </Button>
            ) : (
              <>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Speichern
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  variant="outlined"
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Abbrechen
                </Button>
              </>
            )}
          </Box>
        </GlassCard>
      </Container>

      {/* Snackbar für Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GradientBackground>
  );
};

export default ProfilePage;
