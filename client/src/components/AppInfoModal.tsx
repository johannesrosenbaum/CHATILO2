import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Security,
  Update,
  Code,
  Favorite,
  Close
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GradientDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '1px solid rgba(102, 126, 234, 0.1)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
  }
}));

interface AppInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const AppInfoModal: React.FC<AppInfoModalProps> = ({ open, onClose }) => {
  return (
    <GradientDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              mr: 2
            }}
          >
            C
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            CHATILO
          </Typography>
        </Box>
        <Chip label="Version 1.0.0" color="primary" size="small" />
      </DialogTitle>

      <DialogContent>
        <List>
          <ListItem>
            <ListItemIcon>
              <Security color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Datenschutz"
              secondary="Deine Daten sind Ende-zu-Ende verschlüsselt"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <Update color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Updates"
              secondary="Automatische Updates für neue Features"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <Code color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Open Source"
              secondary="Entwickelt mit React, Node.js & Socket.IO"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <Favorite color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Made with ❤️"
              secondary="Entwickelt für die beste Chat-Erfahrung"
            />
          </ListItem>
        </List>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<Close />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 25,
            px: 4
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </GradientDialog>
  );
};

export default AppInfoModal;
