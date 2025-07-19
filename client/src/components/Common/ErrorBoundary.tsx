import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { theme, gradients } from '../../theme/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            p: 3,
          }}
        >
          <Paper
            sx={{
              maxWidth: 500,
              p: 4,
              textAlign: 'center',
              background: 'rgba(30, 30, 30, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                background: gradients.error,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                color: 'white',
              }}
            >
              ⚠️
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: gradients.error,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Ups! Etwas ist schiefgelaufen
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut oder gehe zur Startseite zurück.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ef4444',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleRefresh}
                startIcon={<RefreshIcon />}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                  },
                }}
              >
                Seite neu laden
              </Button>

              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                startIcon={<HomeIcon />}
                sx={{
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Zur Startseite
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 