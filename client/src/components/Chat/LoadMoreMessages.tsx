import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ExpandLess as ExpandLessIcon } from '@mui/icons-material';

interface LoadMoreMessagesProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  currentMessagesCount: number;
}

const LoadMoreMessages: React.FC<LoadMoreMessagesProps> = ({
  onLoadMore,
  isLoading,
  hasMore,
  currentMessagesCount,
}) => {
  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            px: 3,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '0.875rem',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            🎉 Das ist der Anfang eurer Unterhaltung
          </Typography>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          px: 3,
          mb: 2,
        }}
      >
        <Button
          variant="text"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} />
            ) : (
              <ExpandLessIcon />
            )
          }
          onClick={onLoadMore}
          disabled={isLoading}
          sx={{
            borderRadius: '20px',
            px: 3,
            py: 1,
            color: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.12)',
              borderColor: 'rgba(102, 126, 234, 0.3)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              color: 'rgba(102, 126, 234, 0.5)',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? 'Lade weitere Nachrichten...' : 'Weitere Nachrichten laden'}
        </Button>

        <Typography
          variant="caption"
          sx={{
            color: 'rgba(0, 0, 0, 0.5)',
            fontSize: '0.75rem',
            mt: 1,
            textAlign: 'center',
          }}
        >
          {currentMessagesCount} Nachrichten geladen
        </Typography>
      </Box>
    </motion.div>
  );
};

export default LoadMoreMessages;
