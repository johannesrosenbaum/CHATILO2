import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
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
  '& .MuiInputLabel-root': {
    color: '#667eea',
    fontWeight: 600,
    '&.Mui-focused': {
      color: '#667eea',
    }
  }
}));

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        p: 3,
      }}
    >
      <GradientCard sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            textAlign="center"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 3
            }}
          >
            CHATILO
          </Typography>
          
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
            Erstelle dein Konto
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              name="username"
              label="Benutzername"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
            
            <StyledTextField
              fullWidth
              name="email"
              label="E-Mail"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
            
            <StyledTextField
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />
            
            <StyledTextField
              fullWidth
              name="confirmPassword"
              label="Passwort bestätigen"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
            />

            <GradientButton
              type="submit"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrieren'}
            </GradientButton>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Bereits ein Konto?{' '}
                <Link 
                  href="/login" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Anmelden
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </GradientCard>
    </Box>
  );
};

export default RegisterPage;
