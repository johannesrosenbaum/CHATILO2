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
const WhiteBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#ffffff',
  padding: theme.spacing(2),
}));

const CICard = styled(Paper)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid rgba(99, 102, 241, 0.1)',
  padding: theme.spacing(4),
  color: theme.palette.text.primary,
  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.1)',
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
  border: '3px solid rgba(99, 102, 241, 0.2)',
  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 24px rgba(99, 102, 241, 0.25)',
    border: '3px solid rgba(99, 102, 241, 0.3)',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
      borderWidth: '2px',
    },
  }
}));

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
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

  const handleSave = async () => {
    try {
      // TODO: API-Call zum Speichern der Profildaten
      console.log('Speichere Profildaten:', profileData, selectedImage);
      
      setSnackbar({ 
        open: true, 
        message: 'Profil erfolgreich aktualisiert!', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Fehler beim Speichern des Profils.', 
        severity: 'error' 
      });
    }
  };

  return (
    <WhiteBackground>
      <Container maxWidth="md">
        <CICard elevation={0}>
          {/* ZURÜCK BUTTON */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                color: '#6366f1',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                border: '1px solid rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  transform: 'translateX(-2px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Zurück zur Startseite
            </Button>
          </Box>

          {/* Hidden File Input */}
          <Box
            component="input"
            type="file"
            ref={fileInputRef}
            sx={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          
          {/* Profile Picture & Info - DIREKT AN DER SPITZE */}
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
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'background.paper'
                  }
                }}
              />
            </Box>
            
            <Box mb={2}>
              <TextField
                fullWidth
                label="E-Mail"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'background.paper'
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
                value={profileData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setProfileData({ ...profileData, bio: e.target.value });
                  }
                }}
                variant="outlined"
                helperText={`${profileData.bio.length}/200 Zeichen`}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'background.paper'
                  }
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* SAVE BUTTON - immer verfügbar */}
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              startIcon={<Save />}
              onClick={handleSave}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Profil speichern
            </Button>
          </Box>
        </CICard>
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
    </WhiteBackground>
  );
};

export default ProfilePage;
