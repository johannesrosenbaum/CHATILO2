import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { theme, gradients } from '../../theme/theme';

const steps = ['Account', 'Profil', 'Standort'];

const RegisterScreen: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.email || !formData.password || !formData.confirmPassword || !formData.username)) {
      return;
    }
    if (activeStep === 1 && (!formData.firstName || !formData.lastName)) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.username);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // TODO: Implement Google OAuth
    console.log('Google register clicked');
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.email && formData.password && formData.confirmPassword && formData.username;
      case 1:
        return formData.firstName && formData.lastName;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="Benutzername"
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="Passwort"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="Passwort bestätigen"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwörter stimmen nicht überein' : ''}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
          </Box>
        );

      case 1:
        return (
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="Vorname"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <TextField
                fullWidth
                label="Nachname"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
          </Box>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  background: gradients.success,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Fast fertig!
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Nach der Registrierung kannst du deinen Standort aktivieren, um lokale Chaträume zu entdecken.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <LocationIcon sx={{ color: '#10b981' }} />
                <Typography variant="body2" sx={{ color: '#10b981' }}>
                  Standort wird nach der Registrierung aktiviert
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card
          sx={{
            width: { xs: '100%', sm: 500 },
            background: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: gradients.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <LocationIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </motion.div>
              
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: gradients.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Registrierung
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                Erstelle dein Konto und verbinde dich mit Menschen in deiner Nähe
              </Typography>
            </Box>

            {/* Stepper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#10b981',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#6366f1',
                  },
                  '& .MuiStepLabel-root .Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: 'white',
                    },
                  }}
                >
                  Zurück
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || !isStepValid(activeStep)}
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
                    {isLoading ? 'Registrierung...' : 'Registrierung abschließen'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid(activeStep)}
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
                    Weiter
                  </Button>
                )}
              </Box>
            </Box>

            {/* Divider */}
            {activeStep === 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                  <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      px: 2,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    oder
                  </Typography>
                  <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                </Box>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleRegister}
                    sx={{
                      py: 1.5,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                    startIcon={<GoogleIcon />}
                  >
                    Mit Google registrieren
                  </Button>
                </motion.div>
              </>
            )}

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Bereits ein Konto?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: '#6366f1',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#818cf8',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Jetzt anmelden
                  </Link>
                </Typography>
              </Box>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default RegisterScreen; 