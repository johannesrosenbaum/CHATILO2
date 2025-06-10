import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Person, Settings, LocationOn, LocationOff } from '@mui/icons-material';

const UserProfile: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Mock user data for testing
  const user = {
    username: 'TestUser',
    email: 'test@example.com',
    locationEnabled: true
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          {getInitials(user?.username || 'U')}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">{user?.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem>
          <Person sx={{ mr: 2 }} />
          Profil bearbeiten
        </MenuItem>
        
        <MenuItem>
          {user?.locationEnabled ? (
            <>
              <LocationOn sx={{ mr: 2 }} color="success" />
              Standort aktiviert
            </>
          ) : (
            <>
              <LocationOff sx={{ mr: 2 }} color="disabled" />
              Standort deaktiviert
            </>
          )}
        </MenuItem>
        
        <MenuItem>
          <Settings sx={{ mr: 2 }} />
          Einstellungen
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfile;
