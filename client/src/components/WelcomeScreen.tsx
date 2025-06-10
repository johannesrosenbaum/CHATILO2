import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
  height: 'fit-content',
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',
  backdropFilter: 'blur(5px)',
  borderRadius: 16,
  border: '1px solid rgba(102, 126, 234, 0.05)',
  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.05)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
  }
}));

const WelcomeScreen: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto', // WICHTIG: Ermöglicht Scrolling
        padding: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: { xs: '100vh', sm: 'auto' }, // Responsive min-height
      }}
    >
      {/* Main Welcome Card */}
      <GradientCard 
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 700 }, 
          width: '100%',
          textAlign: 'center',
          mb: { xs: 3, sm: 4 }
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          <ChatIcon 
            sx={{ 
              fontSize: { xs: 60, sm: 80, md: 100 }, 
              color: 'primary.main',
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }} 
          />
          
          <GradientText 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 2
            }}
          >
            Willkommen bei CHATILO
          </GradientText>
          
          <Typography 
            variant="h5" 
            color="text.secondary" 
            paragraph
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
              mb: { xs: 3, sm: 4 }
            }}
          >
            Verbinde dich mit Menschen in deiner Nähe
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Entdecke lokale Gemeinschaften, chatte mit Nachbarn und finde neue Freunde direkt in deiner Umgebung.
          </Typography>
        </CardContent>
      </GradientCard>

      {/* Feature Cards - Responsive Grid */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3 }} 
        sx={{ 
          maxWidth: { xs: '100%', sm: 800, md: 1000 },
          width: '100%',
          mb: { xs: 3, sm: 4 }
        }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <LocationOnIcon 
                sx={{ 
                  fontSize: { xs: 36, sm: 48 }, 
                  color: 'primary.main', 
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} 
              />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Standort-basierte Chats
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                Finde automatisch Chat-Räume in deiner unmittelbaren Umgebung
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <PeopleIcon 
                sx={{ 
                  fontSize: { xs: 36, sm: 48 }, 
                  color: 'primary.main', 
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} 
              />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Lokale Gemeinschaft
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                Baue echte Verbindungen zu Menschen in deiner Nachbarschaft auf
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
        
        <Grid item xs={12} sm={12} md={4}>
          <FeatureCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <ChatIcon 
                sx={{ 
                  fontSize: { xs: 36, sm: 48 }, 
                  color: 'primary.main', 
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} 
              />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Echtzeit Nachrichten
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                Sofortige Kommunikation mit modernster Chat-Technologie
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
      </Grid>
      
      {/* Call to Action */}
      <GradientCard 
        sx={{ 
          maxWidth: { xs: '100%', sm: 500 }, 
          width: '100%',
          textAlign: 'center'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            color="primary" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.2rem' },
              fontWeight: 600
            }}
          >
            Bereit loszulegen?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.5
            }}
          >
            Wähle einen Chat-Room aus der Liste links, um deine lokale Community zu entdecken!
          </Typography>
        </CardContent>
      </GradientCard>
    </Box>
  );
};

export default WelcomeScreen;
