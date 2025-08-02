import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab
} from '@mui/material';
import UserList from './UserList';

interface GameInterfaceProps {
  username: string;
  sessionId: string;
  onLogout: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ username, sessionId, onLogout }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      onLogout();
      setLogoutDialogOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ padding: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to the Adventure!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Hello {username}, you are now logged in and ready to begin your text adventure.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Session ID: {sessionId}
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Game coming soon...
                </Typography>
                <Typography variant="body1">
                  This is where the text adventure game will be implemented. 
                  Your session is active and will persist until you log out.
                </Typography>
              </Box>
            </Paper>
          </Container>
        );
      case 1:
        return <UserList />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Text Adventure Game
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {username}!
          </Typography>
          <Button color="inherit" onClick={handleLogoutClick}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Game" />
          <Tab label="Users" />
        </Tabs>
      </Box>

      {renderTabContent()}

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out? Any unsaved progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameInterface;