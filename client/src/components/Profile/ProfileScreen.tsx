import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { theme, gradients } from '../../theme/theme';
import { getAvatarUrl, debugAvatarUrl } from '../../utils/avatarUtils';

const ProfileScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Debug avatar URL
  React.useEffect(() => {
    if (user?.avatar) {
      debugAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    notifications: user?.preferences?.notifications ?? true,
    privacy: user?.preferences?.privacy || 'public',
    theme: user?.preferences?.theme || 'dark',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profileImage: profileImage || undefined,
        preferences: {
          notifications: formData.notifications,
          privacy: formData.privacy as 'public' | 'friends' | 'private',
          theme: formData.theme as 'dark' | 'light' | 'auto',
        },
      });
      setIsEditing(false);
      setProfileImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      notifications: user?.preferences?.notifications ?? true,
      privacy: user?.preferences?.privacy || 'public',
      theme: user?.preferences?.theme || 'dark',
    });
    setIsEditing(false);
    setProfileImage(null);
    setPreviewImage(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Mein Profil
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                height: 'fit-content',
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    src={previewImage || getAvatarUrl(user?.avatar) || user?.profileImage}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid rgba(255, 255, 255, 0.1)',
                      background: gradients.primary,
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  {isEditing && (
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: gradients.primary,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                        },
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: 'white' }} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
                  {user?.username}
                </Typography>

                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  {user?.email}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {user?.address?.city || 'Standort nicht gesetzt'}
                  </Typography>
                </Box>

                <Chip
                  label={`Mitglied seit ${new Date(user?.createdAt || '').toLocaleDateString('de-DE')}`}
                  size="small"
                  sx={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Profil bearbeiten
                  </Typography>
                  
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        border: '2px solid rgba(99, 102, 241, 0.5)',
                        color: '#6366f1',
                        '&:hover': {
                          border: '2px solid rgba(99, 102, 241, 0.8)',
                          background: 'rgba(99, 102, 241, 0.1)',
                        },
                      }}
                    >
                      Bearbeiten
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        sx={{
                          border: '2px solid rgba(239, 68, 68, 0.5)',
                          color: '#ef4444',
                          '&:hover': {
                            border: '2px solid rgba(239, 68, 68, 0.8)',
                            background: 'rgba(239, 68, 68, 0.1)',
                          },
                        }}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isLoading}
                        sx={{
                          background: gradients.primary,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        {isLoading ? 'Speichern...' : 'Speichern'}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Benutzername"
                      value={formData.username}
                      onChange={handleInputChange('username')}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vorname"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nachname"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Über mich"
                      value={formData.bio}
                      onChange={handleInputChange('bio')}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

                {/* Settings */}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  Einstellungen
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notifications}
                        onChange={handleSwitchChange('notifications')}
                        disabled={!isEditing}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#6366f1',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#6366f1',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Benachrichtigungen
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SecurityIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Datenschutz
                    </Typography>
                  </Box>
                  
                  <TextField
                    select
                    fullWidth
                    label="Sichtbarkeit"
                    value={formData.privacy}
                    onChange={handleInputChange('privacy')}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  >
                    <option value="public">Öffentlich</option>
                    <option value="friends">Nur Freunde</option>
                    <option value="private">Privat</option>
                  </TextField>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PaletteIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Design
                    </Typography>
                  </Box>
                  
                  <TextField
                    select
                    fullWidth
                    label="Theme"
                    value={formData.theme}
                    onChange={handleInputChange('theme')}
                    disabled={!isEditing}
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                    <option value="auto">Automatisch</option>
                  </TextField>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default ProfileScreen; 