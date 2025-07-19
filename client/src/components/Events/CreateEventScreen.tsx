import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import { theme, gradients } from '../../theme/theme';

const CreateEventScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    radius: 1000,
    maxParticipants: 100,
    tags: [] as string[],
    coverImage: null as File | null,
  });
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSliderChange = (field: string) => (event: Event, value: number | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentLocation) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement event creation API call
      console.log('Creating event:', formData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create event:', error);
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
          Event erstellen
        </Typography>

        <Card
          sx={{
            background: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
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
                  />
                </Grid>

                {/* Date and Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Startdatum"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimeIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
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
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enddatum"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange('endDate')}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Endzeit"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange('endTime')}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Location Info */}
                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    sx={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3b82f6',
                    }}
                    icon={<LocationIcon />}
                  >
                    Event wird an deinem aktuellen Standort erstellt: {currentLocation?.address?.city || 'Unbekannt'}
                  </Alert>
                </Grid>

                {/* Radius */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                    Radius: {formatRadius(formData.radius)}
                  </Typography>
                  <Slider
                    value={formData.radius}
                    onChange={handleSliderChange('radius')}
                    min={100}
                    max={10000}
                    step={100}
                    marks={[
                      { value: 100, label: '100m' },
                      { value: 1000, label: '1km' },
                      { value: 5000, label: '5km' },
                      { value: 10000, label: '10km' },
                    ]}
                    sx={{
                      color: '#6366f1',
                      '& .MuiSlider-markLabel': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                </Grid>

                {/* Max Participants */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                    Maximale Teilnehmer: {formData.maxParticipants}
                  </Typography>
                  <Slider
                    value={formData.maxParticipants}
                    onChange={handleSliderChange('maxParticipants')}
                    min={10}
                    max={1000}
                    step={10}
                    marks={[
                      { value: 10, label: '10' },
                      { value: 100, label: '100' },
                      { value: 500, label: '500' },
                      { value: 1000, label: '1000' },
                    ]}
                    sx={{
                      color: '#ec4899',
                      '& .MuiSlider-markLabel': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                </Grid>

                {/* Tags */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        sx={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#6366f1',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Tag hinzufügen"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      sx={{
                        border: '2px solid rgba(99, 102, 241, 0.5)',
                        color: '#6366f1',
                        '&:hover': {
                          border: '2px solid rgba(99, 102, 241, 0.8)',
                          background: 'rgba(99, 102, 241, 0.1)',
                        },
                      }}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Grid>

                {/* Cover Image */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                    Cover Bild (optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    sx={{
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Bild auswählen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </Button>
                  {formData.coverImage && (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', ml: 2 }}>
                      {formData.coverImage.name}
                    </Typography>
                  )}
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/')}
                      sx={{
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          background: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || !formData.name || !formData.description}
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
                      {isLoading ? 'Event wird erstellt...' : 'Event erstellen'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default CreateEventScreen; 