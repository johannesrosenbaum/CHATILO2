import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// IDENTISCHES CHATILO LOGO wie in ChatHeader! 🚀
const ChatiloIcon = styled('div')(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.4)',
  border: '3px solid rgba(102, 126, 234, 0.2)', // ADD BORDER
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.4) 100%)',
    borderRadius: '17px', // Adjusted for border
  }
}));

const ChatiloSymbol = styled('div')(({ theme }) => ({
  fontSize: '48px',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontFamily: '"Inter", sans-serif',
  position: 'relative',
  zIndex: 1,
}));

// GLEICHER GEILER GRADIENT wie ChatHeader! ✨
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 8s ease infinite',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  '@keyframes gradientShift': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  }
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '3rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  letterSpacing: '1px',
  textShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 24,
  padding: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
  maxWidth: 450,
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: 24,
    pointerEvents: 'none'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '200% 200%',
  border: 'none',
  borderRadius: 12,
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: '12px 24px',
  textTransform: 'none',
  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundPosition: '100% 0',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.5)',
  },
  '&:active': {
    transform: 'translateY(0px)',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
    height: 3,
    borderRadius: 2,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#667eea',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#667eea',
  }
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const LogoContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 32,
}));

const LogoIcon = styled(Box)(() => ({
  width: 120,
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
}));

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        setSuccess('Login erfolgreich! Weiterleitung...');
        setTimeout(() => {
          navigate('/chat');
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await register(registerUsername, registerEmail, registerPassword);
      if (result) {
        setSuccess('Registrierung erfolgreich! Weiterleitung...');
        setTimeout(() => {
          navigate('/chat');
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Container maxWidth="sm">
        <GlassCard elevation={0}>
          {/* CHATILO LOGO & TITLE - ERSETZT DURCH NEUES LOGO */}
          <LogoContainer>
            <LogoIcon>
              <img 
                src="/Chatilo_pin.png" 
                alt="CHATILO Logo" 
              />
            </LogoIcon>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 500,
                opacity: 0.8,
                mb: 2
              }}
            >
              Verbinde dich mit deiner Community
            </Typography>
          </LogoContainer>

          {/* ERROR/SUCCESS ALERTS */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
              {success}
            </Alert>
          )}

          {/* TABS */}
          <StyledTabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Anmelden" />
            <Tab label="Registrieren" />
          </StyledTabs>

          {/* LOGIN TAB */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <StyledTextField
                fullWidth
                label="E-Mail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loading}
              />
              
              <StyledTextField
                fullWidth
                label="Passwort"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                disabled={loading}
              />

              <GradientButton
                type="submit"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Anmelden'
                )}
              </GradientButton>
            </Box>
          </TabPanel>

          {/* REGISTER TAB */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleRegister}>
              <StyledTextField
                fullWidth
                label="Benutzername"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
                disabled={loading}
              />
              
              <StyledTextField
                fullWidth
                label="E-Mail"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                disabled={loading}
              />
              
              <StyledTextField
                fullWidth
                label="Passwort"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                disabled={loading}
              />

              <GradientButton
                type="submit"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Registrieren'
                )}
              </GradientButton>
            </Box>
          </TabPanel>

          {/* FOOTER */}
          <Box textAlign="center" mt={4}>
            <Typography variant="caption" color="text.secondary">
              Willkommen bei CHATILO - Deinem lokalen Chat-Netzwerk
            </Typography>
          </Box>
        </GlassCard>
      </Container>
    </GradientBackground>
  );
};

export default LoginPage;
