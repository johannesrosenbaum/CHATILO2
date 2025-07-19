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

  useEffect(() => {
    const fetchRegionalInfo = async () => {
      if (!userLocation) {
        console.log('🏞️ AIWelcome: No userLocation provided, using fallback');
        setError('Fallback');
        setLoading(false);
        return;
      }

      // 🔥 IMPROVED CACHE KEY - include user ID and round coordinates to prevent excessive caching
      const cacheKey = `ai-welcome-${user?._id || 'anonymous'}-${userLocation.name}-${Math.round(userLocation.lat * 1000)}-${Math.round(userLocation.lng * 1000)}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log('💾 AIWelcome: Using cached data for:', userLocation.name);
        try {
          const parsed = JSON.parse(cachedData);
          setRegionalData(parsed);
          setError(null);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('⚠️ AIWelcome: Failed to parse cached data, fetching fresh');
          sessionStorage.removeItem(cacheKey);
        }
      }

      // 🔥 PREVENT MULTIPLE CALLS - check if already fetching
      if (fetchingRef.current) {
        console.log('⏳ AIWelcome: Already fetching, skipping duplicate call');
        return;
      }

      try {
        fetchingRef.current = true;
        console.log('🏞️ AIWelcome: Fetching regional info for:', userLocation);
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('🏞️ AIWelcome: No auth token found');
          setError('Fallback');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/ai/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            locationName: userLocation.name,
            nearbyPlaces: nearbyPlaces
          })
        });

        const data = await response.json();
        
        console.log('🏞️ AIWelcome: Response received:', { 
          status: response.status, 
          success: data.success, 
          hasRegionalNews: !!data.regionalNews,
          error: data.error 
        });
        
        if (data.success && data.regionalNews) {
          setRegionalData(data);
          setError(null);
          
          // 🔥 CACHE THE RESULT
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            console.log('💾 AIWelcome: Cached data for:', userLocation.name);
          } catch (e) {
            console.warn('⚠️ AIWelcome: Failed to cache data:', e);
          }
        } else {
          console.log('🏞️ AIWelcome: API call failed, using fallback');
          setError('Fallback');
        }
      } catch (err) {
        console.error('❌ Regional Info Error:', err);
        setError('Fallback');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    // 🔥 DEBOUNCE - only call if location has stabilized
    const timeoutId = setTimeout(fetchRegionalInfo, 100);
    return () => {
      clearTimeout(timeoutId);
      fetchingRef.current = false;
    };
  }, [userLocation?.name, Math.round((userLocation?.lat || 0) * 1000), Math.round((userLocation?.lng || 0) * 1000), user?._id]);

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
          <Avatar sx={{ bgcolor: '#4a148c', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
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
          <Avatar sx={{ bgcolor: '#4a148c', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
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
                animation: 'gradientShift 3s ease-in-out infinite',
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
                backgroundColor: '#4a148c',
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
          backgroundColor: 'rgba(74, 20, 140, 0.1)', 
          borderRadius: 2,
          border: '1px solid rgba(74, 20, 140, 0.2)'
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

  // Render der AI-generierten Inhalte
  const welcomeMessage = regionalData?.regionalNews?.welcome || 'Willkommen in deiner Region!';
  const regionalInfo = regionalData?.regionalNews?.regionalInfo || 'Hier gibt es viel zu entdecken.';
  const localFeatures = regionalData?.regionalNews?.localFeatures || [];

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
        <Avatar sx={{ bgcolor: '#4a148c', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
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
              animation: 'gradientShift 3s ease-in-out infinite',
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
              backgroundColor: '#4a148c',
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
        backgroundColor: 'rgba(74, 20, 140, 0.1)', 
        borderRadius: 2,
        mb: 2,
        border: '1px solid rgba(74, 20, 140, 0.2)'
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
          📍 Über {userLocation?.name || 'deine Region'}:
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

      {localFeatures && localFeatures.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              mb: 1,
              color: '#b39ddb',
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
          >
            🌟 Besonderheiten der Region:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            mt: 1
          }}>
            {localFeatures.map((feature: string, index: number) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(74, 20, 140, 0.2)',
                  color: 'white',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 20, 140, 0.3)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AIWelcome;
