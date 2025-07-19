import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Skeleton, Avatar, Chip } from '@mui/material';
import { SmartToy, LocationOn, Landscape, Restaurant, Celebration } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface AIWelcomeProps {
  userLocation?: {
    name: string;
    lat: number;
    lng: number;
  };
  nearbyPlaces?: string[];
}

const AIWelcome: React.FC<AIWelcomeProps> = ({ userLocation, nearbyPlaces = [] }) => {
  const { user } = useAuth();
  const [regionalData, setRegionalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const lastLocationNameRef = useRef<string | null>(null);

  // Funktion um regionales Symbol zu bestimmen
  const getRegionalIcon = (locationName: string) => {
    const name = locationName.toLowerCase();
    if (name.includes('berg') || name.includes('tal') || name.includes('wald')) {
      return <Landscape sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />;
    } else if (name.includes('stadt') || name.includes('dorf')) {
      return <Celebration sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />;
    } else {
      return <Restaurant sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />;
    }
  };

  // Add debug logs to trace data fetching and rendering
  useEffect(() => {
    // 🔥 PREVENT MULTIPLE CALLS: Check if location name actually changed
    if (!userLocation?.name || lastLocationNameRef.current === userLocation.name) {
      console.log('🔧 AIWelcome: Skipping fetch - no location or same location:', {
        hasLocation: !!userLocation?.name,
        current: userLocation?.name,
        last: lastLocationNameRef.current,
        same: lastLocationNameRef.current === userLocation?.name
      });
      return;
    }

    // 🔥 PREVENT MULTIPLE CALLS: Only fetch if not currently fetching
    if (fetchingRef.current) {
      console.log('🔧 AIWelcome: Skipping fetch - already fetching');
      return;
    }

    console.log('🔧 AIWelcome useEffect triggered');
    console.log('   userLocation:', userLocation);
    console.log('   nearbyPlaces:', nearbyPlaces);

    lastLocationNameRef.current = userLocation.name;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    const fetchRegionalInfo = async () => {
      console.log('🔧 Fetching regional info...');
      try {
        const response = await fetch('/api/ai/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            latitude: userLocation?.lat,
            longitude: userLocation?.lng,
            locationName: userLocation?.name,
            nearbyPlaces,
            // 🔥 ADD BETTER PROMPT INSTRUCTIONS FOR NATURAL WORDING
            promptStyle: 'natural_concise',
            requestType: 'welcome_with_specific_fact',
            timestamp: new Date().toISOString() // Force unique fact each time
          })
        });

        const data = await response.json();
        console.log('🔧 API response:', data);

        if (data.success) {
          setRegionalData(data);
          console.log('✅ Regional data set:', data);
        } else {
          console.warn('⚠️ API call failed:', data.error);
          setError('Fallback');
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError('Fallback');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchRegionalInfo();
  }, [userLocation?.name]); // 🔥 ONLY TRIGGER ON LOCATION NAME CHANGE

  if (loading) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          m: { xs: 1, sm: 2 }, 
          borderRadius: 3,
          maxWidth: '100%',
          overflow: 'hidden',
          // 🎨 DARKER THEME
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2e0854', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
            <SmartToy />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Box>
      </Paper>
    );
  }

  if (error && !regionalData) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          m: { xs: 1, sm: 2 }, 
          borderRadius: 3, 
          maxWidth: '100%',
          overflow: 'hidden',
          // 🎨 DARKER THEME
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2e0854', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
            <SmartToy />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                mb: 0.5,
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
                backgroundSize: '300% 300%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 8s ease-in-out infinite',
                '@keyframes gradientShift': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' }
                }
              }}
            >
              Hallo {user?.username}! 👋
            </Typography>
            <Chip
              icon={<LocationOn />}
              label={userLocation?.name || 'Unbekannter Standort'}
              size="small"
              sx={{ 
                backgroundColor: '#2e0854',
                color: 'white',
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}
            />
          </Box>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Willkommen bei Chatilo! Entdecke lokale Gespräche und verbinde dich mit Menschen in deiner Umgebung.
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(46, 8, 84, 0.1)', 
          borderRadius: 2,
          border: '1px solid rgba(46, 8, 84, 0.2)'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic',
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
          >
            🌟 Starte ein Gespräch in einem lokalen Chat-Raum oder warte darauf, dass andere Nutzer online kommen!
          </Typography>
        </Box>
      </Paper>
    );
  }

  // 🔥 FIXED: Use correct API response structure
  const welcomeMessage = regionalData?.welcomeMessage || 'Willkommen in deiner Region!';
  const regionalInfo = regionalData?.regionalNews || 'Hier gibt es viel zu entdecken.';
  const locationName = regionalData?.location || userLocation?.name || 'Deine Region';

  if (!regionalData || !regionalData.welcomeMessage) {
    console.warn('⚠️ AIWelcome: Missing welcomeMessage in response, showing fallback');
    console.log('⚠️ AIWelcome: Current regionalData:', regionalData);
  } else {
    console.log('✅ AIWelcome: Dynamic regional data loaded successfully', regionalData?.welcomeMessage?.length || 0);
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        m: { xs: 1, sm: 2 }, 
        borderRadius: 3,
        maxWidth: '100%',
        overflow: 'hidden',
        // 🎨 DARKER THEME
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: '#2e0854', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
          <SmartToy />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              mb: 0.5,
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              // 🎨 USERNAME GRADIENT
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
              backgroundSize: '300% 300%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 8s ease-in-out infinite',
              '@keyframes gradientShift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          >
            Hallo {user?.username}! 👋
          </Typography>
          <Chip
            icon={<LocationOn />}
            label={userLocation?.name || 'Unbekannter Standort'}
            size="small"
            sx={{ 
              backgroundColor: '#2e0854',
              color: 'white',
              fontSize: { xs: '0.75rem', sm: '0.8rem' }
            }}
          />
        </Box>
        {userLocation && getRegionalIcon(userLocation.name)}
      </Box>
      
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 2, 
          lineHeight: 1.6,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        {welcomeMessage}
      </Typography>
      
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'rgba(46, 8, 84, 0.1)', 
        borderRadius: 2,
        mb: 2,
        border: '1px solid rgba(46, 8, 84, 0.2)'
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            mb: 1,
            color: '#b39ddb',
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
        >
          📍 Über {locationName}:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.5,
            fontSize: { xs: '0.8rem', sm: '0.85rem' }
          }}
        >
          {regionalInfo}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AIWelcome;
