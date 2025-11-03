import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  PhotoCamera as PhotoCameraIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';

// CI-konforme styled components (analog zu ProfilePage)
const WhiteBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#ffffff',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    zIndex: 0,
  },
}));

const CICard = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
  border: '1px solid rgba(102, 126, 234, 0.1)',
  position: 'relative',
  zIndex: 1,
  marginTop: '40px',
}));

const CoverImageUpload = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  border: '2px dashed rgba(102, 126, 234, 0.3)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: '#667eea',
    background: 'rgba(102, 126, 234, 0.05)',
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  color: '#667eea',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  fontWeight: 500,
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
  },
}));

interface FormData {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  radius: number;
  maxParticipants: number;
  tags: string[];
  eventType: string;
  coverImage: File | null;
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    radius: 5000, // 5km default
    maxParticipants: 50,
    tags: [],
    eventType: 'meetup',
    coverImage: null,
  });

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: keyof FormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSliderChange = (field: keyof FormData) => (
    event: Event, value: number | number[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validierung
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: 'Bild ist zu groß. Maximum 5MB erlaubt.',
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

      setFormData(prev => ({ ...prev, coverImage: file }));
      
      // Preview erstellen
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!currentLocation) {
      setSnackbar({
        open: true,
        message: 'Standort ist erforderlich. Bitte aktiviere die Standortfreigabe.',
        severity: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Basic fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('startDate', formData.startDate);
      submitData.append('startTime', formData.startTime);
      submitData.append('endDate', formData.endDate || formData.startDate);
      submitData.append('endTime', formData.endTime || formData.startTime);
      submitData.append('radius', formData.radius.toString());
      submitData.append('maxParticipants', formData.maxParticipants.toString());
      submitData.append('eventType', formData.eventType);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('location', JSON.stringify({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address?.street || '',
        city: currentLocation.address?.city || '',
        country: currentLocation.address?.country || ''
      }));

      // Cover image
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Erstellen des Events');
      }

      setSnackbar({
        open: true,
        message: 'Event erfolgreich erstellt! Du wirst zu Villages & Schools weitergeleitet.',
        severity: 'success'
      });

      // Navigate to the created event room
      setTimeout(() => {
        navigate(`/chat/room/${result.event._id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating event:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Fehler beim Erstellen des Events',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRadius = (value: number) => {
    if (value >= 1000) {
      return `${value / 1000} km`;
    }
    return `${value} m`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const eventTypes = [
    { value: 'meetup', label: 'Meetup' },
    { value: 'festival', label: 'Festival' },
    { value: 'concert', label: 'Konzert' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'sport', label: 'Sport' },
    { value: 'food', label: 'Essen & Trinken' },
    { value: 'culture', label: 'Kultur' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Sonstiges' },
  ];

  return (
    <WhiteBackground>
      <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <CICard>
          {/* Zurück Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
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

          {/* Event Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <EventIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            <Typography variant="h4" color="primary" fontWeight={700} textAlign="center">
              Event erstellen
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={1}>
              Erstelle ein Event in deiner Umgebung und bringe Menschen zusammen
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Event Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Event Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  placeholder="Beschreibe dein Event... Was erwartet die Teilnehmer?"
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Event Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Event Typ</InputLabel>
                  <Select
                    value={formData.eventType}
                    onChange={handleSelectChange('eventType')}
                    label="Event Typ"
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Max Participants */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max. Teilnehmer"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleInputChange('maxParticipants')}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 1000 }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Start Date & Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Startdatum"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange('startDate')}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTomorrowDate() }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TimeIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Startzeit"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange('startTime')}
                  required
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* End Date & Time (optional) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Enddatum (optional)"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange('endDate')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formData.startDate || getTomorrowDate() }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Endzeit (optional)"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange('endTime')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Radius Slider */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom color="text.primary">
                  Sichtbarkeitsradius: {formatRadius(formData.radius)}
                </Typography>
                <Slider
                  value={formData.radius}
                  onChange={handleSliderChange('radius')}
                  min={500}
                  max={15000}
                  step={500}
                  marks={[
                    { value: 1000, label: '1km' },
                    { value: 5000, label: '5km' },
                    { value: 10000, label: '10km' },
                    { value: 15000, label: '15km' },
                  ]}
                  sx={{
                    color: '#667eea',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom color="text.primary">
                  Tags (max. 5)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {formData.tags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<CloseIcon />}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Tag hinzufügen"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    variant="outlined"
                    size="small"
                    disabled={formData.tags.length >= 5}
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-root': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || formData.tags.length >= 5}
                    variant="outlined"
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
              </Grid>

              {/* Cover Image Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom color="text.primary">
                  Cover Bild (optional)
                </Typography>
                <CoverImageUpload onClick={() => fileInputRef.current?.click()}>
                  {coverImagePreview ? (
                    <Box
                      component="img"
                      src={coverImagePreview}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px',
                      }}
                    />
                  ) : (
                    <>
                      <PhotoCameraIcon sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Klicken zum Hochladen eines Cover-Bildes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max. 5MB, JPG, PNG
                      </Typography>
                    </>
                  )}
                </CoverImageUpload>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.description || !formData.startDate || !formData.startTime}
                    startIcon={<SaveIcon />}
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 6,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: 'rgba(102, 126, 234, 0.3)',
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isLoading ? 'Event wird erstellt...' : 'Event erstellen'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CICard>
      </Container>

      {/* Snackbar für Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default CreateEventPage;
