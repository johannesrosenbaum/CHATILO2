import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Switch, 
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
  marginBottom: theme.spacing(3),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 12,
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  }
}));

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    locationEnabled: true,
    notifications: true,
    darkMode: false,
    privateProfile: false,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // API-Call würde hier kommen
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        p: 3,
        overflow: 'auto'
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/chat')}
            sx={{ mr: 2, color: 'primary.main' }}
          >
            Zurück
          </Button>
          <Typography 
            variant="h4" 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            Einstellungen
          </Typography>
          {/* ENTFERNT: Chat und Profil Buttons */}
        </Box>

        {/* Einstellungen */}
        <GradientCard>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" sx={{ p: 3, pb: 1 }}>
              App-Einstellungen
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Standort-Dienste"
                  secondary="Ermöglicht lokale Chat-Räume"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.locationEnabled}
                    onChange={handleSettingChange('locationEnabled')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Push-Benachrichtigungen"
                  secondary="Erhalte Nachrichten auch wenn die App geschlossen ist"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications}
                    onChange={handleSettingChange('notifications')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <DarkModeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Dunkles Design"
                  secondary="Aktiviere den Dark Mode"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleSettingChange('darkMode')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <PrivacyTipIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Privates Profil"
                  secondary="Nur Freunde können dein Profil sehen"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.privateProfile}
                    onChange={handleSettingChange('privateProfile')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </GradientCard>

        {/* Speichern */}
        <Box sx={{ textAlign: 'center' }}>
          {saveStatus === 'saved' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Einstellungen erfolgreich gespeichert!
            </Alert>
          )}
          
          <GradientButton 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            size="large"
          >
            {saveStatus === 'saving' ? 'Speichere...' : 'Einstellungen speichern'}
          </GradientButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
