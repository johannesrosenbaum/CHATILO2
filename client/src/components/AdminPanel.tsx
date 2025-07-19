import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import axios from 'axios';

interface AdminSetting {
  _id: string;
  key: string;
  value: any;
  description: string;
  updatedAt: string;
}

const AdminPanel: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const authenticate = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings', {
        headers: { 'admin-token': adminToken }
      });
      
      setSettings(response.data);
      setIsAuthenticated(true);
      setMessage({ type: 'success', text: 'Admin-Zugang erfolgreich!' });
      
      const statusResponse = await axios.get('/api/admin/status', {
        headers: { 'admin-token': adminToken }
      });
      setStatus(statusResponse.data);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Ungültiger Admin-Token!' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await axios.put(`/api/admin/settings/${key}`, 
        { value },
        { headers: { 'admin-token': adminToken } }
      );
      
      setSettings((prev: AdminSetting[]) => prev.map((setting: AdminSetting) => 
        setting.key === key ? { ...setting, value } : setting
      ));
      
      setMessage({ type: 'success', text: `Einstellung ${key} erfolgreich aktualisiert!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Fehler beim Aktualisieren von ${key}` });
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            CHATILO Admin-Panel
          </Typography>
          
          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Admin-Token"
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={authenticate}
            disabled={!adminToken || loading}
          >
            Anmelden
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        CHATILO Admin-Panel
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* System Status */}
      {status && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>System-Status</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="body2">Räume: {status.rooms}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2">Benutzer: {status.users}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2">Nachrichten: {status.messages}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2">Uptime: {Math.round(status.uptime / 60)}min</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Einstellungen */}
      <Grid container spacing={3}>
        {settings.map((setting: AdminSetting) => (
          <Grid item xs={12} md={6} key={setting._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {setting.key}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {setting.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    type={typeof setting.value === 'number' ? 'number' : 'text'}
                    value={setting.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newValue = typeof setting.value === 'number' 
                        ? parseInt(e.target.value) || 0
                        : e.target.value;
                      
                      setSettings((prev: AdminSetting[]) => prev.map((s: AdminSetting) => 
                        s._id === setting._id ? { ...s, value: newValue } : s
                      ));
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => updateSetting(setting.key, setting.value)}
                  >
                    Speichern
                  </Button>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Zuletzt aktualisiert: {new Date(setting.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminPanel;
